const Income = require('../models/Income');

// @desc    Get all incomes
exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(incomes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create income
exports.createIncome = async (req, res) => {
    try {
        const income = await Income.create({ ...req.body, userId: req.user._id });
        res.status(201).json(income);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update income
exports.updateIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!income) return res.status(404).json({ message: 'الدخل غير موجود' });
        res.json(income);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete income
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!income) return res.status(404).json({ message: 'الدخل غير موجود' });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
