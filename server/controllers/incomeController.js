const Income = require('../models/Income');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

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

        const collected = thisMonthIncomes.filter(i => ['محصل', 'received'].includes(i.cashFlowType)).reduce((s, i) => s + i.amount, 0);
        const expected = thisMonthIncomes.filter(i => ['متوقع', 'expected'].includes(i.cashFlowType)).reduce((s, i) => s + i.amount, 0);

        const fixed = thisMonthIncomes.filter(i => ['ثابت', 'fixed'].includes(i.incomeType)).reduce((s, i) => s + i.amount, 0);
        const variable = thisMonthIncomes.filter(i => ['متغير', 'variable'].includes(i.incomeType)).reduce((s, i) => s + i.amount, 0);

        res.json({
            incomes,
            stats: {
                totalIncomeThisMonth,
                collected,
                expected,
                fixed,
                variable,
                fixedRatio: totalIncomeThisMonth > 0 ? ((fixed / totalIncomeThisMonth) * 100).toFixed(1) : 0,
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
        const userId = req.user._id;
        const data = { ...req.body, userId };
        
        // 1. Create specialized income record
        const income = await Income.create(data);

        // 2. Create corresponding Transaction for the Unified Ledger
        if (data.accountId) {
            await Transaction.create({
                userId,
                date: data.date || new Date(),
                type: 'دخل',
                amount: data.amount,
                accountId: data.accountId,
                category: data.source || 'دخل متنوع',
                notes: data.notes,
                status: 'مُسوّى',
                classification: 'operating_income',
                affectsCashflow: true,
                affectsNetworth: true,
                linkedEntity: { entityType: 'None' }
            });

            // 3. Update Account Balance
            const account = await Account.findById(data.accountId);
            if (account) {
                account.balance += data.amount;
                await account.save();
            }
        }

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
