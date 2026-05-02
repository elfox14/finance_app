const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Certificate = require('../models/Certificate');
const { PeerDebt } = require('../models/PeerDebt');
const Budget = require('../models/Budget');
const Group = require('../models/Group');
const GroupPayment = require('../models/GroupPayment');

// Helper to classify legacy transactions
function deriveClassification(tx) {
    if (tx.classification) return tx.classification;
    const entity = tx.linkedEntity?.entityType;
    const isLinked = entity && entity !== 'None';

    if (tx.type === 'التزام') return 'financing_in';
    if (tx.type === 'سداد')  return 'debt_principal_payment';
    if (tx.type === 'تحويل') return 'asset_transfer';
    if (tx.type === 'أصل')   return 'asset_acquisition';

    if (tx.type === 'دخل') {
        if (isLinked && ['Loan', 'PeerDebt'].includes(entity)) return 'financing_in';
        return 'operating_income';
    }
    if (tx.type === 'مصروف') {
        if (tx.category === 'فوائد قروض' || tx.category === 'عمولات') return 'finance_cost';
        return 'operating_expense';
    }
    return 'operating_expense';
}

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
            certificates, debts, budgets,
            groups, groupPayments
        ] = await Promise.all([
            Transaction.find({ userId, status: { $in: ['مُسوّى', 'مُرحَّل'] }, deletedAt: null }),
            Expense.find({ userId }),
            Income.find({ userId, deletedAt: null }),
            Account.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            Certificate.find({ userId, status: 'active' }),
            PeerDebt.find({ userId, deletedAt: null }),
            Budget.find({ userId, month: currentMonth, year: currentYear }),
            Group.find({ userId, deletedAt: null }),
            GroupPayment.find({ userId, deletedAt: null })
        ]);

        // Filter out orphaned transactions linked to deleted entities
        const activeLoanIds = new Set(loans.map(l => l._id.toString()));
        const activeCardIds = new Set(cards.map(c => c._id.toString()));
        const activeDebtIds = new Set(debts.map(d => d._id.toString()));
        const activeGroupIds = new Set(groups.map(g => g._id.toString()));

        const activeTransactions = transactions.filter(tx => {
            const entity = tx.linkedEntity;
            if (!entity || !entity.entityType || entity.entityType === 'None' || !entity.entityId) return true;
            
            const eid = entity.entityId.toString();
            switch (entity.entityType) {
                case 'Loan': return activeLoanIds.has(eid);
                case 'Card': return activeCardIds.has(eid);
                case 'PeerDebt': return activeDebtIds.has(eid);
                case 'Group': return activeGroupIds.has(eid);
                default: return true;
            }
        });

        const unifiedTransactions = [
            ...activeTransactions,
            ...legacyExpenses.map(e => ({ type: 'مصروف', amount: e.amount, date: e.date, category: e.category || e.budgetCategory, status: 'مُسوّى' })),
            ...legacyIncomes.map(i => ({ type: 'دخل', amount: i.amount, date: i.date, category: i.source, status: 'مُسوّى' }))
        ];

        // 2. Trend Analysis
        const trends = [];
        let totalExpensesHistory = 0;
        let monthsWithData = 0;

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const monthTxs = unifiedTransactions.filter(tx => {
                const date = new Date(tx.date);
                return (date.getMonth() + 1) === m && date.getFullYear() === y;
            });
            let income = 0; let expense = 0; let finCost = 0;
            monthTxs.forEach(tx => {
                const cls = deriveClassification(tx);
                if (cls === 'operating_income') income += tx.amount;
                if (cls === 'operating_expense') expense += tx.amount;
                if (cls === 'finance_cost') finCost += tx.amount;
            });
            const totalOut = expense + finCost;
            if (totalOut > 0) { totalExpensesHistory += totalOut; monthsWithData++; }
            trends.push({ month: d.toLocaleString('ar-EG', { month: 'short' }), income, expense: totalOut, net: income - totalOut });
        }
        const avgMonthlyExpense = monthsWithData > 0 ? (totalExpensesHistory / monthsWithData) : 0;

        // 3. Category Breakdown
        const categoryAnalysis = unifiedTransactions.filter(tx => {
            const d = new Date(tx.date);
            const cls = deriveClassification(tx);
            return (cls === 'operating_expense' || cls === 'finance_cost') && (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        }).reduce((acc, tx) => {
            const cat = tx.category || 'أخرى';
            acc[cat] = (acc[cat] || 0) + tx.amount;
            return acc;
        }, {});

        // 4. Budget vs Actual
        const budgetPerformance = budgets.map(b => {
            const spent = categoryAnalysis[b.category] || 0;
            const planned = b.plannedAmount || b.limit || 0;
            return {
                category: b.category, limit: planned, spent,
                percent: planned > 0 ? Math.min(100, (spent / planned) * 100).toFixed(0) : 0,
                status: spent > planned ? 'over' : spent > planned * 0.8 ? 'warning' : 'safe'
            };
        });

        // 5. Obligations Timeline
        const allObligations = [
            ...loans.filter(l => l.status === 'نشط').map(l => ({ name: l.loanName, amount: l.monthlyInstallment || 0, date: l.nextPaymentDate, type: 'loan' })),
            ...cards.filter(c => (c.cardType === 'credit' || c.cardType === 'ائتمانية') && c.currentBalance > 0).map(c => ({ name: c.cardName, amount: c.currentBalance, date: new Date(currentYear, currentMonth - 1, c.dueDay), type: 'card' })),
            ...debts.filter(d => d.type === 'borrowed' && !d.isPaid).map(d => ({ name: d.personName, amount: d.amount, date: d.dueDate, type: 'debt' })),
            ...groups.map(g => ({ name: `قسط جمعية: ${g.groupName}`, amount: g.monthlyAmount, date: new Date(currentYear, currentMonth - 1, new Date(g.startDate).getDate()), type: 'group' }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        const next30DaysObs = allObligations.filter(o => o.date && (new Date(o.date) - now) / (1000 * 60 * 60 * 24) <= 30 && (new Date(o.date) - now) >= -1);
        const totalUpcoming30 = next30DaysObs.reduce((s, o) => s + o.amount, 0);

        // 6. Detailed Wealth Distribution (Including Groups)
        const totalCash = accounts.reduce((s, a) => s + (a.balance || 0), 0);
        const totalInvestments = certificates.reduce((sum, c) => sum + (c.principalAmount || 0), 0);
        const totalLentDebts = debts.filter(d => d.type === 'lent' && !d.isPaid).reduce((sum, d) => sum + (d.amount || 0), 0);
        
        // Groups Analysis:
        let totalGroupAssets = 0;
        let totalGroupLiabilities = 0;
        groups.forEach(g => {
            const paid = groupPayments.filter(p => p.groupId.toString() === g._id.toString()).reduce((s, p) => s + p.amount, 0);
            if (!g.isPaidOut) totalGroupAssets += paid;
            else totalGroupLiabilities += ((g.monthlyAmount * g.durationMonths) - paid);
        });

        const totalAssets = totalCash + totalInvestments + totalLentDebts + totalGroupAssets;

        const totalLoanBalance = loans.reduce((sum, l) => sum + (l.remainingAmount || ((l.principalAmount || 0) - (l.paidAmount || 0))), 0);
        const totalCardDebt = cards.filter(c => (c.cardType === 'credit' || c.cardType === 'ائتمانية')).reduce((s, c) => s + (c.currentBalance || 0), 0);
        const totalBorrowed = debts.filter(d => d.type === 'borrowed' && !d.isPaid).reduce((s, d) => s + (d.amount || 0), 0);
        const totalDebt = totalLoanBalance + totalCardDebt + totalBorrowed + totalGroupLiabilities;

        // 7. Intelligence Engine
        const recommendations = [];
        const lastMonth = trends[trends.length-1];
        const savingsRate = lastMonth.income > 0 ? ((lastMonth.net / lastMonth.income) * 100) : 0;
        const debtRatio = lastMonth.income > 0 ? ((totalUpcoming30 / lastMonth.income) * 100) : 0;

        if (totalUpcoming30 > totalCash) recommendations.push(`⚠️ تحذير سيولة: الالتزامات القادمة (${totalUpcoming30.toLocaleString()} ج.م) تتجاوز الكاش المتاح.`);
        if (avgMonthlyExpense > 0) {
            const monthsCovered = totalCash / avgMonthlyExpense;
            if (monthsCovered < 1) recommendations.push(`❗ صندوق الطوارئ: رصيدك النقدي يغطي أقل من شهر واحد من مصاريفك المعتادة.`);
            else if (monthsCovered > 6 && totalInvestments < totalCash) recommendations.push(`💡 فرصة استثمارية: لديك سيولة نقدية فائضة، ينصح باستثمار جزء منها.`);
        }
        if (debtRatio > 40) recommendations.push(`🔴 عبء الدين مرتفع: التزاماتك تستهلك أكثر من 40% من دخلك.`);
        const overBudgets = budgetPerformance.filter(b => b.status === 'over');
        if (overBudgets.length > 0) recommendations.push(`📉 انضباط الميزانية: لقد تجاوزت الميزانية في ${overBudgets.length} فئات.`);

        res.json({
            summary: { savingsRate: savingsRate.toFixed(1), debtRatio: debtRatio.toFixed(1), totalAssets, totalDebt },
            trends,
            categoryAnalysis,
            budgetPerformance,
            timeline: { next30Days: next30DaysObs, totalUpcoming30 },
            wealthDistribution: {
                cash: totalCash,
                certificates: totalInvestments,
                lent: totalLentDebts + totalGroupAssets, // Lent + Group Savings
                loans: totalLoanBalance,
                cards: totalCardDebt,
                borrowed: totalBorrowed + totalGroupLiabilities // Borrowed + Group Debt
            },
            recommendations
        });
    } catch (error) {
        console.error('Reports Error:', error);
        res.status(500).json({ message: error.message });
    }
};
