const Income = require('../models/Income');

// @desc    Get all incomes with stats
exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user._id, deletedAt: null }).sort({ date: -1 });
        
        // حساب الإحصائيات المحاسبية
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const receivedThisMonth = incomes
            .filter(i => ['محصل', 'received'].includes(i.cashFlowType) && new Date(i.date) >= startOfMonth)
            .reduce((sum, i) => sum + i.amount, 0);

        const accruedThisMonth = incomes
            .filter(i => ['مستحق', 'accrued'].includes(i.cashFlowType) && new Date(i.date) >= startOfMonth)
            .reduce((sum, i) => sum + i.amount, 0);

        const fixedIncomeTotal = incomes
            .filter(i => ['ثابت', 'fixed'].includes(i.incomeType))
            .reduce((sum, i) => sum + i.amount, 0);

        res.json({
            incomes,
            stats: {
                receivedThisMonth,
                accruedThisMonth,
                fixedIncomeTotal,
                fixedRatio: incomes.length > 0 ? ((fixedIncomeTotal / incomes.reduce((s, i) => s + i.amount, 0)) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create income
exports.createIncome = async (req, res) => {
    try {
        console.log('📥 Received Income Data:', req.body);
        const income = await Income.create({ ...req.body, userId: req.user._id });
        res.status(201).json(income);
    } catch (error) {
        console.error('❌ Income Create Error:', error.message);
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
