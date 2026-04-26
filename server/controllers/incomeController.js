const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');

// @desc    Get all incomes with professional cash flow analytics
exports.getIncomes = async (req, res) => {
    try {
        const userId = req.user._id;
        const incomes = await Income.find({ userId, deletedAt: null }).sort({ date: -1 });
        
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);

        const thisMonthIncomes = incomes.filter(i => new Date(i.date) >= startOfMonth);
        const totalIncomeThisMonth = thisMonthIncomes.reduce((sum, i) => sum + i.amount, 0);

        // تحليل الحالة (محصل vs متوقع)
        const collected = thisMonthIncomes.filter(i => ['محصل', 'received'].includes(i.cashFlowType)).reduce((s, i) => s + i.amount, 0);
        const expected = thisMonthIncomes.filter(i => ['متوقع', 'expected'].includes(i.cashFlowType)).reduce((s, i) => s + i.amount, 0);

        // تحليل الطبيعة (ثابت vs متغير)
        const fixed = thisMonthIncomes.filter(i => ['ثابت', 'fixed'].includes(i.incomeType)).reduce((s, i) => s + i.amount, 0);
        const variable = thisMonthIncomes.filter(i => ['متغير', 'variable'].includes(i.incomeType)).reduce((s, i) => s + i.amount, 0);

        // حساب قدرة التغطية (Coverage Ratio)
        const [expenses, loans] = await Promise.all([
            Expense.find({ userId, deletedAt: null, date: { $gte: startOfMonth } }),
            Loan.find({ userId, deletedAt: null, isPaid: false })
        ]);
        const totalObligations = expenses.reduce((s, e) => s + e.amount, 0) + loans.reduce((s, l) => s + l.monthlyPayment, 0);
        const coverageRatio = totalObligations > 0 ? (totalIncomeThisMonth / totalObligations).toFixed(2) : '∞';

        res.json({
            incomes,
            stats: {
                totalIncomeThisMonth,
                collected,
                expected,
                fixed,
                variable,
                fixedRatio: totalIncomeThisMonth > 0 ? ((fixed / totalIncomeThisMonth) * 100).toFixed(1) : 0,
                coverageRatio,
                topSource: Object.entries(thisMonthIncomes.reduce((acc, i) => {
                    acc[i.source] = (acc[i.source] || 0) + i.amount;
                    return acc;
                }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create income
exports.createIncome = async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user._id };
        const income = await Income.create(data);
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
