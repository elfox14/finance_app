const Card = require('../models/Card');
const CardAction = require('../models/CardAction');

// @desc    Get all cards with full credit analytics
exports.getCards = async (req, res) => {
    try {
        const cards = await Card.find({ userId: req.user._id, deletedAt: null });
        const actions = await CardAction.find({ userId: req.user._id, deletedAt: null });

        const cardsWithAnalytics = cards.map(card => {
            const cardActions = actions.filter(a => a.cardId.toString() === card._id.toString());
            
            const totalPurchases = cardActions
                .filter(a => a.type === 'purchase' || a.type === 'fee')
                .reduce((sum, a) => sum + a.amount, 0);
            
            const totalPayments = cardActions
                .filter(a => a.type === 'payment' || a.type === 'reversal')
                .reduce((sum, a) => sum + a.amount, 0);

            const usedAmount = totalPurchases - totalPayments;
            const remainingLimit = card.creditLimit - usedAmount;
            const usagePercent = (usedAmount / card.creditLimit) * 100;

            // تحديد مؤشر الخطر
            let riskStatus = 'ممتاز';
            let riskColor = 'emerald';
            if (usagePercent > 90) { riskStatus = 'خطر'; riskColor = 'red'; }
            else if (usagePercent > 70) { riskStatus = 'مرتفع'; riskColor = 'orange'; }
            else if (usagePercent > 30) { riskStatus = 'طبيعي'; riskColor = 'blue'; }

            return {
                ...card._doc,
                analytics: {
                    usedAmount,
                    remainingLimit,
                    usagePercent: usagePercent.toFixed(1),
                    riskStatus,
                    riskColor,
                    minPayment: (usedAmount * (card.minimumPaymentPercent / 100)).toFixed(2)
                }
            };
        });

        res.json(cardsWithAnalytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add transaction or payment to card
exports.addCardAction = async (req, res) => {
    try {
        const action = await CardAction.create({ ...req.body, userId: req.user._id });
        res.status(201).json(action);
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
