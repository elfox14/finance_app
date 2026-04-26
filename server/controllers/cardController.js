const Card = require('../models/Card');
const CardTransaction = require('../models/CardTransaction');
const CardInstallment = require('../models/CardInstallment');
const CardPayment = require('../models/CardPayment');
const CardStatement = require('../models/CardStatement');

// @desc    Get all cards with full credit analytics
exports.getCards = async (req, res) => {
    try {
        const userId = req.user._id;
        const cards = await Card.find({ userId, deletedAt: null });
        
        // Fetch all transactions and installments to calculate current used amount
        const [transactions, installments] = await Promise.all([
            CardTransaction.find({ userId, deletedAt: null }),
            CardInstallment.find({ userId, deletedAt: null, status: 'نشط' })
        ]);

        const cardsWithAnalytics = cards.map(card => {
            const cardId = card._id.toString();
            
            // 1. Calculate one-time purchases
            const oneTimePurchases = transactions
                .filter(t => t.cardId.toString() === cardId && t.transactionType !== 'تقسيط')
                .reduce((sum, t) => sum + t.amount, 0);

            // 2. Calculate remaining principal for active installments
            // Actually, the card used amount is usually the FULL principal of installments once swiped
            // But some banks show only the monthly due. Professional accounting usually treats the full principal as "used" limit.
            const installmentPrincipal = transactions
                .filter(t => t.cardId.toString() === cardId && t.transactionType === 'تقسيط')
                .reduce((sum, t) => sum + t.amount, 0);

            // 3. Subtract payments (This would be complex without a payment model, but we have it now)
            // But usually, payments reduce the "Current Balance"
            // For simplicity, let's use the full used amount.
            
            const usedAmount = card.currentBalance || 0; // Using the cached balance for now
            const usagePercent = (usedAmount / card.creditLimit) * 100;

            // Health status
            let riskStatus = 'ممتاز';
            let riskColor = 'emerald';
            if (usagePercent > 90) { riskStatus = 'خطر'; riskColor = 'red'; }
            else if (usagePercent > 70) { riskStatus = 'مرتفع'; riskColor = 'orange'; }
            else if (usagePercent > 30) { riskStatus = 'طبيعي'; riskColor = 'blue'; }

            return {
                ...card._doc,
                analytics: {
                    usedAmount,
                    remainingLimit: card.creditLimit - usedAmount,
                    usagePercent: usagePercent.toFixed(1),
                    riskStatus,
                    riskColor,
                    totalInstallments: installments.filter(i => i.cardId.toString() === cardId).length,
                    monthlyInstallmentTotal: installments
                        .filter(i => i.cardId.toString() === cardId)
                        .reduce((sum, i) => sum + i.installmentAmount, 0)
                }
            };
        });

        res.json(cardsWithAnalytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add transaction to card (Supports Installments)
exports.addCardTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId, merchantName, amount, transactionDate, category, transactionType, isInstallment, installmentDetails } = req.body;

        // 1. Create Transaction
        const transaction = await CardTransaction.create({
            userId, cardId, merchantName, amount, transactionDate, category, transactionType, isInstallment
        });

        // 2. Handle Installment if selected
        if (isInstallment && installmentDetails) {
            const { installmentsCount, interestRate, installmentAmount: manualInstallmentAmount } = installmentDetails;
            
            let principal = amount;
            let total = 0;
            let monthly = 0;

            if (interestRate !== undefined) {
                // Case A: Calculate from Interest Rate
                const interestAmount = principal * (interestRate / 100);
                total = principal + interestAmount;
                monthly = total / installmentsCount;
            } else if (manualInstallmentAmount) {
                // Case B: Calculate from Monthly Amount
                monthly = manualInstallmentAmount;
                total = monthly * installmentsCount;
            }

            const installment = await CardInstallment.create({
                userId, cardId, transactionId: transaction._id,
                principalAmount: principal,
                installmentsCount,
                installmentAmount: monthly,
                interestRate: interestRate || 0,
                totalAfterInterest: total,
                startMonth: new Date(transactionDate).getMonth() + 1,
                startYear: new Date(transactionDate).getFullYear()
            });

            transaction.installmentId = installment._id;
            await transaction.save();
        }

        // 3. Update Card Balance
        const card = await Card.findById(cardId);
        card.currentBalance += Number(amount);
        await card.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create card
exports.createCard = async (req, res) => {
    try {
        const card = await Card.create({ ...req.body, userId: req.user._id });
        res.status(201).json(card);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update card
exports.updateCard = async (req, res) => {
    try {
        const card = await Card.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!card) return res.status(404).json({ message: 'البطاقة غير موجودة' });
        res.json(card);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get detailed info for a single card (Transactions, Installments, Payments)
exports.getCardDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const [transactions, installments, payments] = await Promise.all([
            CardTransaction.find({ userId, cardId: id, deletedAt: null }).sort({ transactionDate: -1 }),
            CardInstallment.find({ userId, cardId: id, deletedAt: null }).sort({ createdAt: -1 }),
            CardPayment.find({ userId, cardId: id, deletedAt: null }).sort({ paymentDate: -1 })
        ]);

        res.json({ transactions, installments, payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record a payment to a card
exports.addCardPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId, amount, paymentDate, paymentType, sourceAccount, notes } = req.body;

        // 1. Create Payment record
        const payment = await CardPayment.create({
            userId, cardId, amount, paymentDate, paymentType, sourceAccount, notes
        });

        // 2. Update Card Balance (Subtracting payment)
        const card = await Card.findById(cardId);
        card.currentBalance -= Number(amount);
        if (card.currentBalance < 0) card.currentBalance = 0;
        await card.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete card
exports.deleteCard = async (req, res) => {
    try {
        const card = await Card.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!card) return res.status(404).json({ message: 'البطاقة غير موجودة' });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
