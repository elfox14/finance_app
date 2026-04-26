const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Group = require('../models/Group');
const { PeerDebt } = require('../models/PeerDebt');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [incomes, expenses, loans, cards, groups, debts] = await Promise.all([
            Income.find({ userId, deletedAt: null }),
            Expense.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            Group.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null })
        ]);

        // 1. حسابات الدخل والمصروف
        const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
        const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
        const currentBalance = totalIncome - totalExpense;

        // 2. الدخل والمصروف المتوقع (Expected)
        const expectedIncome = incomes.filter(i => i.isRecurring).reduce((s, i) => s + i.amount, 0) || totalIncome;
        const expectedExpense = expenses.filter(e => e.isRecurring).reduce((s, e) => s + e.amount, 0) || totalExpense;

        // 3. التزامات 30 يوم
        const upcomingLoans = loans.reduce((s, l) => s + l.monthlyInstallment, 0);
        const upcomingGroups = groups.reduce((s, g) => s + g.monthlyAmount, 0);
        const upcomingDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid && d.dueDate && new Date(d.dueDate).getMonth() === now.getMonth()).reduce((s, d) => s + d.amount, 0);
        const total30DayObligations = upcomingLoans + upcomingGroups + upcomingDebts;

        const availableBalance = currentBalance - total30DayObligations;

        // 🧠 4. خوارزمية مؤشر الصحة المالية (Score 0-100)
        let healthScore = 100;
        
        // أ. نسبة الالتزام للدخل (Penalty if > 40%)
        const dti = totalIncome > 0 ? (total30DayObligations / (totalIncome / 12 || 1)) : 0;
        if (dti > 0.4) healthScore -= 20;
        else if (dti > 0.2) healthScore -= 10;

        // ب. معدل الادخار (Bonus if > 20%)
        const savingsRate = totalIncome > 0 ? (currentBalance / totalIncome) : 0;
        if (savingsRate < 0.1) healthScore -= 15;
        else if (savingsRate > 0.3) healthScore += 5;

        // ج. وجود متأخرات (Heavy Penalty)
        const hasOverdue = debts.some(d => !d.isPaid && d.dueDate && new Date(d.dueDate) < now);
        if (hasOverdue) healthScore -= 25;

        // د. استخدام البطاقات (Penalty if > 70%)
        // (سنفترض وجود استهلاك عالي إذا كان الرصيد المتاح سالباً)
        if (availableBalance < 0) healthScore -= 20;

        healthScore = Math.max(0, Math.min(100, healthScore));

        res.json({
            topStats: {
                currentBalance,
                availableBalance,
                totalObligations: total30DayObligations,
                expectedIncome,
                expectedExpense,
                healthScore
            },
            healthFactors: {
                savingsRate: (savingsRate * 100).toFixed(1),
                debtRatio: (dti * 100).toFixed(1),
                liquidityScore: Math.min(100, (availableBalance / (total30DayObligations || 1)) * 100).toFixed(1)
            },
            distribution: expenses.reduce((acc, e) => {
                const cat = e.budgetCategory || e.category || 'أخرى';
                acc[cat] = (acc[cat] || 0) + e.amount;
                return acc;
            }, {}),
            recentActions: [...expenses, ...incomes]
                .map(item => ({
                    ...item._doc || item,
                    type: item.amount > 0 && incomes.includes(item) ? 'income' : 'expense'
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
