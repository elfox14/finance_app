const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const { PeerDebt } = require('../models/PeerDebt');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Certificate = require('../models/Certificate');

// Payment Models for precise cash flow
const LoanPayment = require('../models/LoanPayment');
const CardPayment = require('../models/CardPayment');
const GroupPayment = require('../models/GroupPayment');
const Account = require('../models/Account');
const kpiService = require('../services/kpiService');
const Transaction = require('../models/Transaction');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 1. Fetch data with correct userId
        const [allExpenses, allIncomes, loans, cards, debts, groups, budgets, certificates, loanPayments, cardPayments, groupPayments, peerPayments, accounts] = await Promise.all([
            Expense.find({ userId }),
            Income.find({ userId }),
            Loan.find({ userId }),
            Card.find({ userId }),
            PeerDebt.find({ userId }), 
            Group.find({ userId }), 
            Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() }),
            Certificate.find({ userId, status: 'نشطة' }),
            LoanPayment.find({ userId }),
            CardPayment.find({ userId }),
            GroupPayment.find({ userId }),
            PeerDebtPayment.find({ userId }),
            Account.find({ userId })
        ]);

        const kpiSnapshot = await kpiService.getLatestSnapshot(userId);

        // 2. Filter current month data
        const currentMonthExpenses = allExpenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const currentMonthIncomes = allIncomes.filter(i => {
            const d = new Date(i.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const expectedIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);

        // 3. Next 30 Day Obligations (التزامات قريبة)
        const activeLoans = loans.filter(l => (l.status === 'نشط' || l.status === 'active') && (l.remainingAmount || 0) > 0);
        const upcomingLoans = activeLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
        
        const activeCards = cards.filter(c => (c.status === 'نشطة' || c.status === 'active') && (c.currentBalance || 0) > 0);
        const upcomingCards = activeCards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        
        const activeGroups = groups.filter(g => !g.isPaidOut || (g.analytics?.monthsPaid < g.durationMonths));
        const upcomingGroups = activeGroups.reduce((sum, g) => sum + (g.monthlyAmount || 0), 0);
        
        const activeBorrowedDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid);
        const upcomingDebts = activeBorrowedDebts.reduce((sum, d) => sum + (d.amount || 0), 0);

        const next30DayObligations = upcomingLoans + upcomingCards + upcomingGroups + upcomingDebts;

        // 4. Next 30 Day Receivables (حقوق)
        const activeLentDebts = debts.filter(d => d.type === 'lent' && !d.isPaid);
        const upcomingLent = activeLentDebts.reduce((sum, d) => sum + (d.amount || 0), 0);
        
        let expectedGroupReturns = 0;
        groups.filter(g => !g.isPaidOut).forEach(g => {
            if (g.startDate && g.userPayoutOrder) {
                const payoutDate = new Date(g.startDate);
                payoutDate.setMonth(payoutDate.getMonth() + g.userPayoutOrder - 1);
                if (payoutDate.getMonth() === now.getMonth() && payoutDate.getFullYear() === now.getFullYear()) {
                    expectedGroupReturns += g.totalAmount;
                }
            }
        });

        let expectedCertReturns = 0;
        certificates.forEach(c => {
             if (c.payoutFrequency === 'شهري') {
                 expectedCertReturns += (c.principalAmount * (c.interestRate / 100)) / 12;
             }
        });

        const next30DayReceivables = upcomingLent + expectedGroupReturns + expectedCertReturns;

        // 5. Cash Flow & Balances (True Accounting Logic)
        const totalIncomeReceived = allIncomes.filter(i => ['محصل', 'received'].includes(i.cashFlowType)).reduce((sum, i) => sum + i.amount, 0);
        
        // Add money received from lent debts and borrowed debts principal
        const lentDebtsIds = debts.filter(d => d.type === 'lent').map(d => d._id.toString());
        const totalLentRecovered = peerPayments.filter(p => lentDebtsIds.includes(p.debtId.toString())).reduce((sum, p) => sum + p.amount, 0);
        const totalBorrowedReceived = debts.filter(d => d.type === 'borrowed').reduce((sum, d) => sum + d.amount, 0);
        
        // Add Loan Principals received and Group Payouts
        const totalLoanReceived = loans.reduce((sum, l) => sum + l.principalAmount, 0);
        const totalGroupPayoutsReceived = groups.filter(g => g.isPaidOut).reduce((sum, g) => sum + g.totalAmount, 0);
        
        const totalReceived = totalIncomeReceived + totalLentRecovered + totalBorrowedReceived + totalLoanReceived + totalGroupPayoutsReceived;

        // Calculate all money out
        const totalExpensesPaid = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalLoanPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalCardPaid = cardPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalGroupPaid = groupPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Add money paid for borrowed debts and lent principal sent
        const borrowedDebtsIds = debts.filter(d => d.type === 'borrowed').map(d => d._id.toString());
        const totalBorrowedPaid = peerPayments.filter(p => borrowedDebtsIds.includes(p.debtId.toString())).reduce((sum, p) => sum + p.amount, 0);
        const totalLentSent = debts.filter(d => d.type === 'lent').reduce((sum, d) => sum + d.amount, 0);

        const totalSpent = totalExpensesPaid + totalLoanPaid + totalCardPaid + totalGroupPaid + totalBorrowedPaid + totalLentSent;
        
        const currentBalance = totalReceived - totalSpent;
        const availableBalance = currentBalance - next30DayObligations;
        const expectedNetFlow = expectedIncome - totalExpenses;

        // 6. Indicators
        const savingsRateRaw = expectedIncome > 0 ? ((expectedIncome - totalExpenses - next30DayObligations) / expectedIncome) * 100 : 0;
        const dtiRaw = expectedIncome > 0 ? (next30DayObligations / expectedIncome) * 100 : 0;
        
        const totalCardBalance = activeCards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        const totalCardLimit = activeCards.reduce((sum, c) => sum + (c.creditLimit || 1), 0);
        const cardUtilization = activeCards.length > 0 && totalCardLimit > 0 ? (totalCardBalance / totalCardLimit) * 100 : 0;
        
        const avgMonthlyExpense = totalExpenses > 0 ? totalExpenses : 1;
        const liquidityCoverageMonths = availableBalance / avgMonthlyExpense;

        const healthScore = Math.max(0, Math.min(100, 100 - (dtiRaw * 0.5) - (availableBalance < 0 ? 40 : 0) - (cardUtilization > 80 ? 20 : 0) + (savingsRateRaw > 20 ? 10 : 0)));

        // 7. Budgets Array
        const budgetsResponse = budgets.map(b => {
            const spent = currentMonthExpenses.filter(e => e.category === b.category).reduce((sum, e) => sum + e.amount, 0);
            return {
                category: b.category,
                limit: b.limit,
                spent: spent,
                remaining: b.limit - spent,
                percent: b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0
            };
        });

        // 8. Upcoming Obligations List
        const upcomingObligations = [
            ...activeLoans.map(l => ({ type: 'loan', name: l.loanName, amount: l.monthlyInstallment || 0, dueDate: l.nextPaymentDate || l.firstDueDate || now })),
            ...activeGroups.map(g => ({ type: 'group', name: g.groupName, amount: g.monthlyAmount, dueDate: new Date(now.getFullYear(), now.getMonth(), 28) })),
            ...activeCards.map(c => ({ type: 'card', name: c.cardName, amount: c.currentBalance || 0, dueDate: new Date(now.getFullYear(), now.getMonth(), c.dueDay || 25) })),
            ...activeBorrowedDebts.map(d => ({ type: 'debt', name: `سلفة من ${d.personName}`, amount: d.amount, dueDate: d.dueDate || now }))
        ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

        // 9. Insights
        const insights = [];
        if (savingsRateRaw > 15) {
            insights.push("أنت ضمن الحدود الآمنة للادخار هذا الشهر.");
        } else if (savingsRateRaw < 0) {
            insights.push("معدل الادخار سلبي، نفقاتك والتزاماتك تتجاوز دخلك.");
        } else {
             insights.push("يمكنك تحسين معدل ادخارك بتخفيض المصروفات غير الأساسية.");
        }

        const overspentBudgets = budgetsResponse.filter(b => b.percent > 100);
        if (overspentBudgets.length > 0) {
            insights.push(`تجاوزت الميزانية في: ${overspentBudgets.map(b => b.category).join('، ')}.`);
        }

        if (cardUtilization > 80) insights.push("استخدام البطاقات الائتمانية مرتفع جداً ويشكل ضغطاً على السيولة.");
        if (liquidityCoverageMonths > 0 && liquidityCoverageMonths < 1) insights.push(`رصيدك المتاح يغطي ${liquidityCoverageMonths.toFixed(1)} شهر فقط من المصروفات.`);
        else if (liquidityCoverageMonths < 0) insights.push("رصيدك المتاح بالسالب، هناك ضغط كبير على السيولة.");

        // 10. Chart Data Generators
        
        // A. 12-Month Cashflow
        const cashflowData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleDateString('ar-EG', { month: 'short' });
            
            const monthIncomes = allIncomes.filter(inc => {
                const incD = new Date(inc.date);
                return incD.getMonth() === d.getMonth() && incD.getFullYear() === d.getFullYear();
            }).reduce((sum, inc) => sum + inc.amount, 0);

            const monthExpenses = allExpenses.filter(exp => {
                const expD = new Date(exp.date);
                return expD.getMonth() === d.getMonth() && expD.getFullYear() === d.getFullYear();
            }).reduce((sum, exp) => sum + exp.amount, 0);

            const netProfit = monthIncomes - monthExpenses;
            cashflowData.push({ month: monthLabel, income: monthIncomes, expense: monthExpenses, netProfit });
        }

        // B. Expense Distribution by Category (Current Month)
        const categoryMap = {};
        currentMonthExpenses.forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });
        const categoryData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] })).sort((a,b) => b.value - a.value);

        // C. Asset Distribution
        const totalCash = accounts.filter(a => a.type === 'نقدي' || a.type === 'cash').reduce((sum, a) => sum + a.balance, 0);
        const totalBank = accounts.filter(a => a.type === 'بنكي' || a.type === 'bank').reduce((sum, a) => sum + a.balance, 0);
        const totalWallets = accounts.filter(a => a.type === 'محفظة' || a.type === 'wallet').reduce((sum, a) => sum + a.balance, 0);
        const totalInvestments = certificates.reduce((sum, c) => sum + c.principalAmount, 0);
        
        const assetDistribution = [
            { name: 'نقدي', value: totalCash },
            { name: 'حسابات بنكية', value: totalBank },
            { name: 'محافظ إلكترونية', value: totalWallets },
            { name: 'شهادات استثمار', value: totalInvestments },
        ].filter(a => a.value > 0);

        // Count pending transactions
        const pendingTransactions = await Transaction.countDocuments({ userId, status: { $in: ['غير مصنف', 'مصنف'] } });

        // Unified Response
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
            accountingKPIs: kpiSnapshot,
            upcomingObligations,
            insights,
            charts: {
                cashflow: cashflowData,
                categories: categoryData,
                assets: assetDistribution
            }
        });

    } catch (err) {
        console.error('🔥 Dashboard Summary Engine Error:', err);
        res.status(500).json({ message: 'خطأ في تجميع البيانات النهائية للوحة التحكم' });
    }
};
