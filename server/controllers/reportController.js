const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Certificate = require('../models/Certificate');
const { PeerDebt } = require('../models/PeerDebt');
const Budget = require('../models/Budget');

exports.getReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // 1. Fetch all necessary data
        const [
            transactions, legacyExpenses, legacyIncomes,
            accounts, loans, cards, 
            certificates, debts, budgets
        ] = await Promise.all([
            Transaction.find({ userId, status: { $in: ['مُسوّى', 'مُرحَّل'] }, deletedAt: null }),
            Expense.find({ userId, deletedAt: null }),
            Income.find({ userId, deletedAt: null }),
            Account.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            Certificate.find({ userId }),
            PeerDebt.find({ userId, deletedAt: null }),
            Budget.find({ userId, month: currentMonth, year: currentYear })
        ]);

        const unifiedTransactions = [
            ...transactions,
            ...legacyExpenses.map(e => ({ type: 'مصروف', amount: e.amount, date: e.date, category: e.category || e.budgetCategory, status: 'مُسوّى' })),
            ...legacyIncomes.map(i => ({ type: 'دخل', amount: i.amount, date: i.date, category: i.source, status: 'مُسوّى' }))
        ];

        // 2. Trend Analysis (Last 6 Months Income vs Expense)
        const trends = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            
            const monthTxs = unifiedTransactions.filter(tx => {
                const date = new Date(tx.date);
                return (date.getMonth() + 1) === m && date.getFullYear() === y;
            });

            const income = monthTxs.filter(tx => tx.type === 'دخل').reduce((s, tx) => s + tx.amount, 0);
            const expense = monthTxs.filter(tx => tx.type === 'مصروف').reduce((s, tx) => s + tx.amount, 0);

            trends.push({
                month: d.toLocaleString('ar-EG', { month: 'short' }),
                income,
                expense,
                net: income - expense
            });
        }

        // 3. Category Breakdown (Current Month)
        const currentMonthExpenses = unifiedTransactions.filter(tx => {
            const d = new Date(tx.date);
            return tx.type === 'مصروف' && (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        });

        const categoryAnalysis = currentMonthExpenses.reduce((acc, tx) => {
            const cat = tx.category || 'أخرى';
            acc[cat] = (acc[cat] || 0) + tx.amount;
            return acc;
        }, {});

        // 4. Budget vs Actual
        const budgetPerformance = budgets.map(b => {
            const spent = categoryAnalysis[b.category] || 0;
            const planned = b.plannedAmount || b.limit || 0;
            return {
                category: b.category,
                limit: planned,
                spent: spent,
                percent: planned > 0 ? Math.min(100, (spent / planned) * 100).toFixed(0) : 0,
                status: spent > planned ? 'over' : spent > planned * 0.8 ? 'warning' : 'safe'
            };
        });

        // 5. Obligations Timeline (7, 30 days)
        const allObligations = [
            ...loans.filter(l => l.status === 'نشط' || !l.isPaid).map(l => ({ name: l.loanName, amount: l.monthlyPayment, date: l.nextPaymentDate, type: 'loan' })),
            ...cards.filter(c => c.cardType === 'credit' && c.currentBalance > 0).map(c => ({ name: c.cardName, amount: c.currentBalance, date: new Date(currentYear, currentMonth - 1, c.dueDay), type: 'card' })),
            ...debts.filter(d => d.type === 'borrowed' && !d.isPaid).map(d => ({ name: d.personName, amount: d.amount, date: d.dueDate, type: 'debt' }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        const next30DaysObs = allObligations.filter(o => o.date && (new Date(o.date) - now) / (1000 * 60 * 60 * 24) <= 30 && (new Date(o.date) - now) >= 0);

        // 6. Summary Assets & Liabilities
        const totalCash = accounts.reduce((s, a) => s + (a.balance || 0), 0);
        const totalCerts = certificates.filter(c => c.status === 'active').reduce((s, c) => s + (c.principalAmount || 0), 0);
        const totalAssets = totalCash + totalCerts;

        const totalLoans = loans.filter(l => l.status === 'نشط').reduce((s, l) => s + l.amountRemaining, 0);
        const totalCardDebt = cards.filter(c => c.cardType === 'credit').reduce((s, c) => s + c.currentBalance, 0);
        const totalBorrowed = debts.filter(d => d.type === 'borrowed' && !d.isPaid).reduce((s, d) => s + d.amount, 0);
        const totalLent = debts.filter(d => d.type === 'lent' && !d.isPaid).reduce((s, d) => s + d.amount, 0);
        const totalDebt = totalLoans + totalCardDebt + totalBorrowed;

        // 7. Smart Recommendations
        const recommendations = [];
        if (budgetPerformance.some(b => b.status === 'over')) {
            const over = budgetPerformance.filter(b => b.status === 'over');
            recommendations.push(`تحذير: لقد تجاوزت الموازنة المحددة في ${over.length} فئات هذا الشهر.`);
        }
        
        const lastMonth = trends[trends.length-1];
        if (lastMonth.income > 0) {
            const savingsRate = lastMonth.net / lastMonth.income;
            if (savingsRate < 0.1) recommendations.push("نسبة الادخار منخفضة (أقل من 10%). حاول تقليل المصروفات في فئات مثل الترفيه أو التسوق.");
        }
        
        if (totalDebt > totalAssets) {
            recommendations.push("انتباه: إجمالي الالتزامات يتجاوز إجمالي الأصول المتاحة.");
        }

        const summary = {
            savingsRate: lastMonth.income > 0 ? ((lastMonth.net / lastMonth.income) * 100).toFixed(1) : 0,
            debtRatio: lastMonth.income > 0 ? ((next30DaysObs.reduce((s, o) => s + o.amount, 0) / lastMonth.income) * 100).toFixed(1) : 0,
            totalAssets: totalAssets + totalLent,
            totalDebt: totalDebt
        };

        const timeline = {
            next30Days: next30DaysObs,
            totalUpcoming30: next30DaysObs.reduce((s, o) => s + o.amount, 0)
        };

        res.json({
            summary,
            trends,
            categoryAnalysis,
            budgetPerformance,
            timeline,
            recommendations,
            wealthDistribution: {
                cash: totalCash,
                certificates: totalCerts,
                lent: totalLent,
                loans: totalLoans,
                cards: totalCardDebt,
                borrowed: totalBorrowed
            }
        });

    } catch (error) {
        console.error('Reports Error:', error);
        res.status(500).json({ message: error.message });
    }
};
