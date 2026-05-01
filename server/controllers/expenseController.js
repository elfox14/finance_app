const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const startOfLastMonth = new Date(lastMonthYear, lastMonth - 1, 1);
        const endOfLastMonth = new Date(currentYear, currentMonth - 1, 0);

        const thisMonthExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
        const totalSpentThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        const lastMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d >= startOfLastMonth && d <= endOfLastMonth;
        });
        const totalSpentLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        let momChange = 0;
        if (totalSpentLastMonth > 0) {
            momChange = (((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth) * 100).toFixed(1);
        }

        const fixedTotal = thisMonthExpenses.filter(e => e.expenseType === 'ثابت').reduce((s, e) => s + e.amount, 0);
        const variableTotal = thisMonthExpenses.filter(e => e.expenseType === 'متغير').reduce((s, e) => s + e.amount, 0);

        const budgets = await Budget.find({ userId, month: currentMonth, year: currentYear });
        const categoryAnalysis = thisMonthExpenses.reduce((acc, e) => {
            const cat = e.category || 'عام';
            acc[cat] = (acc[cat] || 0) + e.amount;
            return acc;
        }, {});

        const budgetStatus = budgets.map(b => {
            const actual = categoryAnalysis[b.category] || 0;
            return {
                category: b.category,
                limit: b.plannedAmount || b.limit,
                actual,
                remaining: (b.plannedAmount || b.limit) - actual,
                percent: (b.plannedAmount || b.limit) > 0 ? ((actual / (b.plannedAmount || b.limit)) * 100).toFixed(0) : 0,
                status: actual > (b.plannedAmount || b.limit) ? 'over' : actual > (b.plannedAmount || b.limit) * 0.8 ? 'warning' : 'safe'
            };
        });

        res.json({
            expenses,
            stats: {
                totalSpentThisMonth,
                totalSpentLastMonth,
                momChange,
                fixedTotal,
                variableTotal,
                budgetStatus,
                topCategory: Object.entries(categoryAnalysis).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = { ...req.body, userId };
        
        // 1. Create specialized expense record
        const expense = await Expense.create(data);

        // 2. Create corresponding Transaction for the Unified Ledger
        if (data.accountId) {
            await Transaction.create({
                userId,
                date: data.date || new Date(),
                type: 'مصروف',
                amount: data.amount,
                accountId: data.accountId,
                category: data.category || 'عام',
                notes: data.notes,
                status: 'مُسوّى',
                classification: 'operating_expense',
                affectsCashflow: true,
                affectsNetworth: true,
                linkedEntity: { entityType: 'None' } // Independent expense
            });

            // 3. Update Account Balance (Double-entry principle)
            const account = await Account.findById(data.accountId);
            if (account) {
                account.balance -= data.amount;
                await account.save();
            }
        }

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

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

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!expense) return res.status(404).json({ message: 'المصروف غير موجود' });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
