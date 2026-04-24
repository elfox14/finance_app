const Income = require('../models/Income');

// @desc    Get all incomes
// @route   GET /api/incomes
exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user._id }).populate('categoryId');
        res.json(incomes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create income
// @route   POST /api/incomes
exports.createIncome = async (req, res) => {
    try {
        const income = await Income.create({ ...req.body, userId: req.user._id });
        res.status(201).json(income);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
exports.updateIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!income) return res.status(404).json({ message: 'العملية غير موجودة' });
        res.json(income);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Soft delete income
// @route   DELETE /api/incomes/:id
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() },
            { new: true }
        );
        if (!income) return res.status(404).json({ message: 'العملية غير موجودة' });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
