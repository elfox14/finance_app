const Card = require('../models/Card');
const CardTransaction = require('../models/CardTransaction');
const CardInstallment = require('../models/CardInstallment');
const CardPayment = require('../models/CardPayment');
const Transaction = require('../models/Transaction');

// @desc    Get all cards with full credit analytics
exports.getCards = async (req, res) => {
    try {
        const userId = req.user._id;
        const cards = await Card.find({ userId, deletedAt: null }).populate('linkedAccountId', 'name');
        
        let totalCreditLimit = 0;
        let totalUsedCredit = 0;
        let totalUnreconciled = 0;

        // Populate recent transactions for dashboard
        const recentTransactions = await CardTransaction.find({ userId, deletedAt: null })
            .populate('cardId', 'cardName cardType')
            .sort({ transactionDate: -1 })
            .limit(10);

        const cardsWithAnalytics = await Promise.all(cards.map(async (card) => {
            const cardId = card._id.toString();
            
            const transactions = await CardTransaction.find({ cardId, deletedAt: null });
            const installments = await CardInstallment.find({ cardId, deletedAt: null, status: 'نشط' });

            const unreconciled = transactions.filter(t => t.reconciliationStatus === 'pending').length;
            totalUnreconciled += unreconciled;

            let riskStatus = 'طبيعي';
            let riskColor = 'blue';
            let usagePercent = 0;

            if (card.cardType === 'credit' || card.cardType === 'ائتمانية') {
                totalCreditLimit += card.creditLimit;
                totalUsedCredit += card.currentBalance;

                usagePercent = card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0;
                
                if (usagePercent > 90) { riskStatus = 'خطر'; riskColor = 'red'; }
                else if (usagePercent > 70) { riskStatus = 'مرتفع'; riskColor = 'orange'; }
                else if (usagePercent > 30) { riskStatus = 'طبيعي'; riskColor = 'blue'; }
            }

            return {
                ...card._doc,
                analytics: {
                    usedAmount: card.currentBalance,
                    remainingLimit: card.cardType === 'debit' || card.cardType === 'خصم مباشر' ? 0 : card.creditLimit - card.currentBalance,
                    usagePercent: usagePercent.toFixed(1),
                    riskStatus,
                    riskColor,
                    unreconciledCount: unreconciled,
                    totalInstallments: installments.length,
                    monthlyInstallmentTotal: installments.reduce((sum, i) => sum + i.installmentAmount, 0)
                }
            };
        }));

        res.json({
            cards: cardsWithAnalytics,
            recentTransactions,
            stats: {
                totalCreditLimit,
                totalUsedCredit,
                totalAvailableCredit: totalCreditLimit - totalUsedCredit,
                totalUnreconciled
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add transaction to card (Supports Installments)
exports.addCardTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId, merchantName, amount, transactionDate, category, transactionType, isInstallment, installmentDetails } = req.body;

        const card = await Card.findById(cardId);
        if (!card) throw new Error('البطاقة غير موجودة');

        // 1. Create Card Transaction
        const cardTx = await CardTransaction.create({
            userId, cardId, merchantName, amount: Number(amount), transactionDate, category, transactionType, isInstallment,
            reconciliationStatus: 'pending' // Default to pending for manual reconciliation later
        });

        // 2. Handle Installment if selected (only makes sense for Credit, but allowed generally)
        if (isInstallment && installmentDetails) {
            const { installmentsCount, interestRate, installmentAmount: manualInstallmentAmount } = installmentDetails;
            let principal = Number(amount);
            let total = 0, monthly = 0;

            if (interestRate !== undefined) {
                const interestAmount = principal * (Number(interestRate) / 100);
                total = principal + interestAmount;
                monthly = total / Number(installmentsCount);
            } else if (manualInstallmentAmount) {
                monthly = Number(manualInstallmentAmount);
                total = monthly * Number(installmentsCount);
            }

            const installment = await CardInstallment.create({
                userId, cardId, transactionId: cardTx._id,
                principalAmount: principal, installmentsCount, installmentAmount: monthly,
                interestRate: Number(interestRate || 0), totalAfterInterest: total,
                startMonth: new Date(transactionDate).getMonth() + 1,
                startYear: new Date(transactionDate).getFullYear()
            });

            cardTx.installmentId = installment._id;
            await cardTx.save();
        }

        // 3. Update Balances & Unified Ledger based on Card Type
        const isCredit = card.cardType === 'credit' || card.cardType === 'ائتمانية';
        const isDebit = card.cardType === 'debit' || card.cardType === 'خصم مباشر';

        if (isCredit) {
            // Credit Card: Increase liability (currentBalance)
            card.currentBalance += Number(amount);
            await card.save();

            // Record as an Expense in the unified ledger, but without deducting from a cash account immediately
            await Transaction.create({
                userId, date: transactionDate || new Date(), type: 'مصروف', amount: Number(amount),
                category, counterparty: merchantName, status: 'مُسوّى',
                notes: `مشتريات بطاقة ائتمان: ${card.cardName}`,
                linkedEntity: { entityType: 'Card', entityId: card._id }
            });

        } else if (isDebit) {
            // Debit Card: Deduct directly from linked bank account
            if (card.linkedAccountId) {
                await Transaction.create({
                    userId, date: transactionDate || new Date(), type: 'مصروف', amount: Number(amount),
                    accountId: card.linkedAccountId, category, counterparty: merchantName, status: 'مُسوّى',
                    notes: `مشتريات بطاقة خصم: ${card.cardName}`,
                    linkedEntity: { entityType: 'Card', entityId: card._id }
                });
            }
        }

        res.status(201).json(cardTx);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reconcile card transaction
exports.reconcileTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'matched', 'disputed', etc.
        const tx = await CardTransaction.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { reconciliationStatus: status },
            { new: true }
        );
        res.json(tx);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create card
exports.createCard = async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user._id };
        if (data.cardType === 'debit' || data.cardType === 'خصم مباشر') {
            data.creditLimit = 0; // Debit cards don't have credit limits
        }
        const card = await Card.create(data);
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

// @desc    Get detailed info for a single card
exports.getCardDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const [transactions, installments, payments] = await Promise.all([
            CardTransaction.find({ userId, cardId: id, deletedAt: null }).sort({ transactionDate: -1 }),
            CardInstallment.find({ userId, cardId: id, deletedAt: null }).sort({ createdAt: -1 }),
            CardPayment.find({ userId, cardId: id, deletedAt: null }).populate('sourceAccount', 'name').sort({ paymentDate: -1 })
        ]);

        res.json({ transactions, installments, payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record a payment to a credit card
exports.addCardPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId, amount, paymentDate, paymentType, sourceAccount, notes } = req.body;

        const card = await Card.findById(cardId);
        if (!card) throw new Error('البطاقة غير موجودة');

        // 1. Create Payment record
        const payment = await CardPayment.create({
            userId, cardId, amount: Number(amount), paymentDate, paymentType, sourceAccount, notes
        });

        // 2. Update Card Balance (Subtracting payment to clear liability)
        card.currentBalance -= Number(amount);
        if (card.currentBalance < 0) card.currentBalance = 0;
        await card.save();

        // 3. Create a Transaction to reflect the cash leaving the bank account to pay the credit card
        if (sourceAccount) {
            await Transaction.create({
                userId, date: paymentDate || new Date(), type: 'سداد', amount: Number(amount),
                accountId: sourceAccount, category: 'سداد بطاقة ائتمان', counterparty: card.bankName, status: 'مُسوّى',
                notes: `سداد مستحقات بطاقة: ${card.cardName} ${notes ? '- '+notes : ''}`,
                linkedEntity: { entityType: 'Card', entityId: card._id }
            });
        }

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
