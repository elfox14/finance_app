const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get all budgets for current month
exports.getBudgets = async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const budgets = await Budget.find({ userId: req.user._id, month, year });
        
        // جلب المصروفات الحالية لمقارنتها بالميزانية
        const startOfMonth = new Date(year, month - 1, 1);
        const expenses = await Expense.find({ 
            userId: req.user._id, 
            date: { $gte: startOfMonth },
            deletedAt: null 
        });

        // حساب التقدم لكل ميزانية
        const budgetsWithProgress = budgets.map(b => {
            const spent = expenses
                .filter(e => e.budgetCategory === b.category)
                .reduce((sum, e) => sum + e.amount, 0);
            
            return {
                ...b._doc,
                spent,
                remaining: b.limit - spent,
                percent: ((spent / b.limit) * 100).toFixed(1)
            };
        });

        res.json(budgetsWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set or Update budget
exports.setBudget = async (req, res) => {
    const { category, limit } = req.body;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user._id, category, month, year },
            { limit },
            { upsert: true, new: true, runValidators: true }
        );
        res.json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
