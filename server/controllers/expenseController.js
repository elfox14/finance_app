const Expense = require('../models/Expense');

// @desc    Get all expenses with professional analytics
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id, deletedAt: null }).sort({ date: -1 });
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisMonthExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
        const totalSpentThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // تحليل الفئات (Budget Categories)
        const categoryAnalysis = thisMonthExpenses.reduce((acc, e) => {
            acc[e.budgetCategory] = (acc[e.budgetCategory] || 0) + e.amount;
            return acc;
        }, {});

        // تحليل الضروريات (Basic vs Luxury)
        const basicTotal = thisMonthExpenses.filter(e => ['أساسي', 'basic'].includes(e.necessityLevel)).reduce((s, e) => s + e.amount, 0);
        const luxuryTotal = thisMonthExpenses.filter(e => ['كمالي', 'luxury'].includes(e.necessityLevel)).reduce((s, e) => s + e.amount, 0);

        res.json({
            expenses,
            analytics: {
                totalSpentThisMonth,
                categoryAnalysis,
                basicVsLuxury: {
                    basic: basicTotal,
                    luxury: luxuryTotal,
                    ratio: totalSpentThisMonth > 0 ? ((luxuryTotal / totalSpentThisMonth) * 100).toFixed(1) : 0
                },
                topCategory: Object.entries(categoryAnalysis).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create expense
exports.createExpense = async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user._id };
        // Mapping frontend fields to backend schema
        if (data.category && !data.budgetCategory) data.budgetCategory = data.category;
        if (data.account && !data.paymentSource) data.paymentSource = data.account;
        
        const expense = await Expense.create(data);
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update expense
exports.updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!expense) return res.status(404).json({ message: 'المصروف غير موجود' });
        res.json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!expense) return res.status(404).json({ message: 'المصروف غير موجود' });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
