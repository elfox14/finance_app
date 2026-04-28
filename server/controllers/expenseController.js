const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // جلب المصروفات غير المحذوفة
        // لاحظ إضافة فلتر لعدم جلب المحذوف مؤقتاً لو كان موجوداً في الـ Schema (تجاهلناه في المخطط الجديد لكن احتياطاً)
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const startOfLastMonth = new Date(lastMonthYear, lastMonth - 1, 1);
        const endOfLastMonth = new Date(currentYear, currentMonth - 1, 0); // آخر يوم في الشهر الماضي

        // 1. حساب مصروفات الشهر الحالي
        const thisMonthExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
        const totalSpentThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // 2. حساب مصروفات الشهر الماضي
        const lastMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d >= startOfLastMonth && d <= endOfLastMonth;
        });
        const totalSpentLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // 3. نسبة التغير (MoM)
        let momChange = 0;
        if (totalSpentLastMonth > 0) {
            momChange = (((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth) * 100).toFixed(1);
        } else if (totalSpentThisMonth > 0) {
            momChange = 100;
        }

        // 4. الثابت مقابل المتغير
        const fixedTotal = thisMonthExpenses.filter(e => e.expenseType === 'ثابت').reduce((s, e) => s + e.amount, 0);
        const variableTotal = thisMonthExpenses.filter(e => e.expenseType === 'متغير').reduce((s, e) => s + e.amount, 0);

        // 5. العمليات التي تحتاج تصنيف أو مراجعة
        const pendingCount = expenses.filter(e => ['new', 'flagged'].includes(e.status)).length;
        const uncategorizedCount = thisMonthExpenses.filter(e => e.status !== 'reconciled').length;

        // 6. الميزانيات وتجاوزاتها
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
                limit: b.limit,
                actual,
                remaining: b.limit - actual,
                percent: b.limit > 0 ? ((actual / b.limit) * 100).toFixed(0) : 0,
                status: actual > b.limit ? 'over' : actual > b.limit * 0.8 ? 'warning' : 'safe'
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
                pendingCount,
                uncategorizedCount,
                budgetStatus,
                topCategory: Object.entries(categoryAnalysis).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد',
                categoryAnalysis
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user._id };
        
        // الضوابط المحاسبية: إذا لم تحدد فئة فهي جديدة، وإلا مصنفة.
        if (!data.status) {
            data.status = (!data.category || data.category === 'عام') ? 'new' : 'categorized';
        }

        const expense = await Expense.create(data);
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
