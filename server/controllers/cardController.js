const Card = require('../models/Card');

// @desc    Get all cards
exports.getCards = async (req, res) => {
    try {
        const cards = await Card.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.json({ message: 'تم حذف البطاقة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
