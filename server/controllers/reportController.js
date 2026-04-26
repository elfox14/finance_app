const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Group = require('../models/Group');
const { PeerDebt } = require('../models/PeerDebt');
const Budget = require('../models/Budget');

// @desc    Get comprehensive financial reports and decision-making data
exports.getReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // 1. Fetch ALL relevant data
        const [incomes, expenses, loans, cards, groups, debts, budgets] = await Promise.all([
            Income.find({ userId, deletedAt: null }),
            Expense.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            Group.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null }),
            Budget.find({ userId, month: currentMonth, year: currentYear })
        ]);

        // 2. Trend Analysis (Last 6 Months)
        const trends = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            
            const mIncomes = incomes.filter(inc => {
                const date = new Date(inc.date);
                return (date.getMonth() + 1) === m && date.getFullYear() === y;
            }).reduce((s, inc) => s + inc.amount, 0);

            const mExpenses = expenses.filter(exp => {
                const date = new Date(exp.date);
                return (date.getMonth() + 1) === m && date.getFullYear() === y;
            }).reduce((s, exp) => s + exp.amount, 0);

            trends.push({
                month: d.toLocaleString('ar-EG', { month: 'short' }),
                income: mIncomes,
                expense: mExpenses,
                net: mIncomes - mExpenses
            });
        }

        // 3. Category Breakdown (Current Month)
        const currentMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        });

        const categoryAnalysis = currentMonthExpenses.reduce((acc, e) => {
            const cat = e.budgetCategory || 'أخرى';
            acc[cat] = (acc[cat] || 0) + e.amount;
            return acc;
        }, {});

        // 4. Budget vs Actual
        const budgetPerformance = budgets.map(b => {
            const spent = categoryAnalysis[b.category] || 0;
            return {
                category: b.category,
                limit: b.limit,
                spent: spent,
                percent: Math.min(100, (spent / b.limit) * 100).toFixed(0),
                status: spent > b.limit ? 'over' : spent > b.limit * 0.8 ? 'warning' : 'safe'
            };
        });

        // 5. Obligations Timeline (7, 30, 90 days)
        const allObligations = [
            ...loans.filter(l => !l.isPaid).map(l => ({ name: l.loanName, amount: l.monthlyPayment, date: l.nextPaymentDate, type: 'loan' })),
            ...cards.filter(c => c.currentBalance > 0).map(c => ({ name: c.cardName, amount: c.currentBalance, date: new Date(currentYear, currentMonth - 1, c.dueDay), type: 'card' })),
            ...debts.filter(d => d.type === 'borrowed' && !d.isPaid).map(d => ({ name: d.personName, amount: d.amount, date: d.dueDate, type: 'debt' }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        const timeline = {
            next7Days: allObligations.filter(o => o.date && (new Date(o.date) - now) / (1000 * 60 * 60 * 24) <= 7),
            next30Days: allObligations.filter(o => o.date && (new Date(o.date) - now) / (1000 * 60 * 60 * 24) <= 30),
            totalUpcoming30: allObligations.filter(o => o.date && (new Date(o.date) - now) / (1000 * 60 * 60 * 24) <= 30).reduce((s, o) => s + o.amount, 0)
        };

        // 6. Smart Recommendations
        const recommendations = [];
        if (budgetPerformance.some(b => b.status === 'over')) {
            const over = budgetPerformance.find(b => b.status === 'over');
            recommendations.push(`لقد تجاوزت ميزانية ${over.category}، يرجى الحذر في الإنفاق لهذا القسم.`);
        }
        const savingsRate = trends[trends.length-1].income > 0 ? (trends[trends.length-1].net / trends[trends.length-1].income) : 0;
        if (savingsRate < 0.1) recommendations.push("نسبة الادخار منخفضة جداً (أقل من 10%)، ابحث عن فرص لتقليل المصاريف غير الضرورية.");
        
        // 7. Summary KPIs
        const summary = {
            savingsRate: (savingsRate * 100).toFixed(1),
            debtRatio: (timeline.totalUpcoming30 / (trends[trends.length-1].income || 1) * 100).toFixed(1),
            totalAssets: incomes.reduce((s, i) => s + i.amount, 0) - expenses.reduce((s, e) => s + e.amount, 0),
            totalDebt: allObligations.reduce((s, o) => s + o.amount, 0)
        };

        res.json({
            summary,
            trends,
            categoryAnalysis,
            budgetPerformance,
            timeline,
            recommendations
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
