const Expense = require('../models/Expense');

// @desc    Get all expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create expense
exports.createExpense = async (req, res) => {
    try {
        const expense = await Expense.create({ ...req.body, userId: req.user._id });
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete expense (Soft Delete)
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() },
            { new: true }
        );
        res.json({ message: 'تم حذف المصروف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
