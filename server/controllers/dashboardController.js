const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const { PeerDebt } = require('../models/PeerDebt');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Certificate = require('../models/Certificate');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // 1. Fetch data with correct userId
        const [
            transactions, accounts, loans, cards, debts, 
            groups, budgets, certificates
        ] = await Promise.all([
            Transaction.find({ userId, deletedAt: null }),
            Account.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null }), 
            Group.find({ userId, deletedAt: null }), 
            Budget.find({ userId, month: currentMonth, year: currentYear }),
            Certificate.find({ userId, status: 'active' }) // Active certificates
        ]);

        // 2. Filter valid and posted transactions
        const postedTransactions = transactions.filter(t => ['مُرحَّل', 'مُسوّى'].includes(t.status));
        const currentMonthTxs = postedTransactions.filter(t => {
            const d = new Date(t.date);
            return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        });

        const currentMonthExpenses = currentMonthTxs.filter(t => t.type === 'مصروف').reduce((s, t) => s + t.amount, 0);
        const currentMonthIncomes = currentMonthTxs.filter(t => t.type === 'دخل').reduce((s, t) => s + t.amount, 0);

        // 3. Next 30 Day Obligations
        const activeLoans = loans.filter(l => l.status === 'نشط' && (l.amountRemaining || l.amount) > 0);
        const upcomingLoans = activeLoans.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
        
        const activeCards = cards.filter(c => c.cardType === 'credit' && (c.currentBalance || 0) > 0);
        const upcomingCards = activeCards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        
        const activeGroups = groups.filter(g => !g.isPaidOut);
        const upcomingGroups = activeGroups.reduce((sum, g) => sum + (g.monthlyAmount || 0), 0);
        
        const activeBorrowedDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid);
        const upcomingDebts = activeBorrowedDebts.reduce((sum, d) => sum + (d.amount || 0), 0);

        const next30DayObligations = upcomingLoans + upcomingCards + upcomingGroups + upcomingDebts;

        // 4. Next 30 Day Receivables (حقوق)
        const activeLentDebts = debts.filter(d => d.type === 'lent' && !d.isPaid);
        const upcomingLent = activeLentDebts.reduce((sum, d) => sum + (d.amount || 0), 0);
        
        // Approximation for cert interest
        let expectedCertReturns = 0;
        certificates.forEach(c => {
             if (c.payoutFrequency === 'شهري') {
                 expectedCertReturns += (c.principalAmount * (c.interestRate / 100)) / 12;
             }
        });

        const next30DayReceivables = upcomingLent + expectedCertReturns;

        // 5. Cash Flow & Balances
        const currentBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
        const availableBalance = currentBalance - next30DayObligations;
        const expectedNetFlow = currentMonthIncomes - currentMonthExpenses;

        // 6. Indicators
        const savingsRateRaw = currentMonthIncomes > 0 ? ((currentMonthIncomes - currentMonthExpenses - next30DayObligations) / currentMonthIncomes) * 100 : 0;
        const dtiRaw = currentMonthIncomes > 0 ? (next30DayObligations / currentMonthIncomes) * 100 : 0;
        
        const totalCardBalance = activeCards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        const totalCardLimit = activeCards.reduce((sum, c) => sum + (c.creditLimit || 1), 0);
        const cardUtilization = activeCards.length > 0 && totalCardLimit > 0 ? (totalCardBalance / totalCardLimit) * 100 : 0;
        
        const avgMonthlyExpense = currentMonthExpenses > 0 ? currentMonthExpenses : 1;
        const liquidityCoverageMonths = availableBalance / avgMonthlyExpense;

        const healthScore = Math.max(0, Math.min(100, 100 - (dtiRaw * 0.5) - (availableBalance < 0 ? 40 : 0) - (cardUtilization > 80 ? 20 : 0) + (savingsRateRaw > 20 ? 10 : 0)));

        // 7. Budgets Array
        const budgetsResponse = budgets.map(b => {
            const spent = currentMonthTxs.filter(t => t.type === 'مصروف' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0);
            const limit = b.plannedAmount || b.limit || 0;
            return {
                category: b.category,
                limit: limit,
                spent: spent,
                remaining: limit - spent,
                percent: limit > 0 ? Math.round((spent / limit) * 100) : 0
            };
        });

        // 8. Upcoming Obligations List
        const upcomingObligationsList = [
            ...activeLoans.map(l => ({ type: 'loan', name: l.loanName, amount: l.monthlyPayment || 0, dueDate: l.nextPaymentDate || now })),
            ...activeGroups.map(g => ({ type: 'group', name: g.groupName, amount: g.monthlyAmount, dueDate: new Date(now.getFullYear(), now.getMonth(), 28) })), // approximate
            ...activeCards.map(c => ({ type: 'card', name: c.cardName, amount: c.currentBalance || 0, dueDate: new Date(now.getFullYear(), now.getMonth(), c.dueDay || 25) })),
            ...activeBorrowedDebts.map(d => ({ type: 'debt', name: `سلفة من ${d.personName}`, amount: d.amount, dueDate: d.dueDate || now }))
        ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

        // 9. Insights
        const insights = [];
        if (savingsRateRaw > 15) {
            insights.push("أنت ضمن الحدود الآمنة للادخار هذا الشهر.");
        } else if (savingsRateRaw < 0) {
            insights.push("معدل الادخار سلبي، نفقاتك والتزاماتك تتجاوز دخلك.");
        }

        const overspentBudgets = budgetsResponse.filter(b => b.percent > 100);
        if (overspentBudgets.length > 0) {
            insights.push(`تجاوزت الميزانية في: ${overspentBudgets.map(b => b.category).join('، ')}.`);
        }

        if (cardUtilization > 80) insights.push("استخدام البطاقات الائتمانية مرتفع جداً ويشكل ضغطاً على السيولة.");

        // 10. Chart Data Generators
        // A. 12-Month Cashflow
        const cashflowData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleDateString('ar-EG', { month: 'short' });
            
            const monthTxs = postedTransactions.filter(t => {
                const txD = new Date(t.date);
                return txD.getMonth() === d.getMonth() && txD.getFullYear() === d.getFullYear();
            });

            const income = monthTxs.filter(t => t.type === 'دخل').reduce((s, t) => s + t.amount, 0);
            const expense = monthTxs.filter(t => t.type === 'مصروف').reduce((s, t) => s + t.amount, 0);

            cashflowData.push({ month: monthLabel, income, expense, netProfit: income - expense });
        }

        // B. Expense Distribution by Category (Current Month)
        const categoryMap = {};
        currentMonthTxs.filter(t => t.type === 'مصروف').forEach(e => {
            const cat = e.category || 'أخرى';
            categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
        });
        const categoryData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] })).sort((a,b) => b.value - a.value);

        // C. Asset Distribution
        const assetDistribution = [];
        accounts.forEach(a => {
            const typeLabel = a.type || 'بنكي';
            const existing = assetDistribution.find(x => x.name === typeLabel);
            if (existing) existing.value += a.balance || 0;
            else assetDistribution.push({ name: typeLabel, value: a.balance || 0 });
        });
        
        const totalInvestments = certificates.reduce((sum, c) => sum + (c.principalAmount || 0), 0);
        if (totalInvestments > 0) assetDistribution.push({ name: 'شهادات استثمار', value: totalInvestments });

        // Count pending transactions
        const pendingTransactions = transactions.filter(t => ['غير مصنف', 'مصنف'].includes(t.status)).length;

        res.json({
            topStats: {
                currentBalance: Math.max(0, currentBalance),
                availableBalance,
                next30DayObligations,
                next30DayReceivables,
                expectedNetFlow,
                healthScore: Math.round(healthScore),
                pendingTransactions
            },
            budgets: budgetsResponse,
            indicators: {
                savingsRate: Number(savingsRateRaw.toFixed(1)),
                debtToIncomeRatio: Number(dtiRaw.toFixed(1)),
                cardUtilization: Number(cardUtilization.toFixed(1)),
                liquidityCoverageMonths: Number(liquidityCoverageMonths.toFixed(1))
            },
            upcomingObligations: upcomingObligationsList,
            insights,
            charts: {
                cashflow: cashflowData,
                categories: categoryData,
                assets: assetDistribution.filter(a => a.value > 0)
            }
        });

    } catch (err) {
        console.error('🔥 Dashboard Summary Engine Error:', err);
        res.status(500).json({ message: 'خطأ في تجميع البيانات النهائية للوحة التحكم' });
    }
};
