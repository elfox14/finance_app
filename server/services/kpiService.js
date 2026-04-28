const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const { PeerDebt } = require('../models/PeerDebt');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Certificate = require('../models/Certificate');
const Account = require('../models/Account');
const LoanPayment = require('../models/LoanPayment');
const CardPayment = require('../models/CardPayment');
const GroupPayment = require('../models/GroupPayment');
const { PeerDebtPayment } = require('../models/PeerDebt');
const User = require('../models/User');
const KPISnapshot = require('../models/KPISnapshot');

const calculateUserKPIs = async (userId, targetDate = new Date()) => {
    // 1. Fetch data
    const [
        allExpenses, allIncomes, loans, cards, debts, groups, 
        budgets, certificates, loanPayments, cardPayments, 
        groupPayments, peerPayments, accounts
    ] = await Promise.all([
        Expense.find({ userId }),
        Income.find({ userId }),
        Loan.find({ userId }),
        Card.find({ userId }),
        PeerDebt.find({ userId }), 
        Group.find({ userId }), 
        Budget.find({ userId, month: targetDate.getMonth() + 1, year: targetDate.getFullYear() }),
        Certificate.find({ userId, status: 'نشطة' }),
        LoanPayment.find({ userId }),
        CardPayment.find({ userId }),
        GroupPayment.find({ userId }),
        PeerDebtPayment.find({ userId }),
        Account.find({ userId })
    ]);

    // Current Month Filter
    const isCurrentMonth = (dString) => {
        const d = new Date(dString);
        return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
    };
    
    // Last Month Filter
    const isLastMonth = (dString) => {
        const d = new Date(dString);
        let lm = new Date(targetDate);
        lm.setMonth(lm.getMonth() - 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    };

    const currentExpenses = allExpenses.filter(e => isCurrentMonth(e.date));
    const currentIncomes = allIncomes.filter(i => isCurrentMonth(i.date));
    const lastMonthIncomes = allIncomes.filter(i => isLastMonth(i.date));

    // Basic Totals MTD
    const incomeMTD = currentIncomes.reduce((sum, i) => sum + i.amount, 0);
    const expensesMTD = currentExpenses.reduce((sum, i) => sum + i.amount, 0);
    const netIncomeMTD = incomeMTD - expensesMTD;
    const netMarginMTD = incomeMTD > 0 ? (netIncomeMTD / incomeMTD) * 100 : 0;
    
    // Growth
    const lmIncomeTotal = lastMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const incomeGrowthMoM = lmIncomeTotal > 0 ? ((incomeMTD - lmIncomeTotal) / lmIncomeTotal) * 100 : (incomeMTD > 0 ? 100 : 0);

    // Cash On Hand
    const cashOnHand = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    // Operating Cash Flow MTD
    const opInflows = currentIncomes.filter(i => ['محصل', 'received'].includes(i.cashFlowType)).reduce((sum, i) => sum + i.amount, 0);
    const opOutflows = currentExpenses.reduce((sum, i) => sum + i.amount, 0);
    const operatingCashFlowMTD = opInflows - opOutflows;

    // Working Capital (Available Balance)
    const activeLoans = loans.filter(l => (l.status === 'نشط' || l.status === 'active') && (l.remainingAmount || 0) > 0);
    const upcomingLoans = activeLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
    
    const activeCards = cards.filter(c => (c.status === 'نشطة' || c.status === 'active') && (c.currentBalance || 0) > 0);
    const upcomingCards = activeCards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
    
    const activeGroups = groups.filter(g => !g.isPaidOut || (g.analytics?.monthsPaid < g.durationMonths));
    const upcomingGroups = activeGroups.reduce((sum, g) => sum + (g.monthlyAmount || 0), 0);
    
    const activeBorrowedDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid);
    const upcomingDebts = activeBorrowedDebts.reduce((sum, d) => sum + (d.amount || 0), 0);

    const next30DayObligations = upcomingLoans + upcomingCards + upcomingGroups + upcomingDebts;
    const workingCapital = cashOnHand - next30DayObligations;

    // Personal / Small Business Metrics
    const savingsRate = incomeMTD > 0 ? ((incomeMTD - expensesMTD - next30DayObligations) / incomeMTD) * 100 : 0;
    
    const fixedCategories = ['سكن', 'فواتير', 'أقساط', 'اشتراكات', 'إيجار'];
    const fixedExpenses = currentExpenses.filter(e => fixedCategories.includes(e.category)).reduce((sum, e) => sum + e.amount, 0);
    const fixedExpensesRatio = incomeMTD > 0 ? (fixedExpenses / incomeMTD) * 100 : 0;

    const debtToIncomeRatio = incomeMTD > 0 ? (next30DayObligations / incomeMTD) * 100 : 0;

    const budgetTargetMTD = budgets.reduce((sum, b) => sum + b.limit, 0);

    return {
        netIncomeMTD,
        netMarginMTD,
        incomeMTD,
        incomeGrowthMoM,
        cashOnHand,
        operatingCashFlowMTD,
        workingCapital,
        savingsRate,
        fixedExpensesRatio,
        debtToIncomeRatio,
        expensesMTD,
        budgetTargetMTD,
        details: {
            fixedExpenses,
            next30DayObligations
        }
    };
};

const generateSnapshotForUser = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize date to start of day

        const kpis = await calculateUserKPIs(userId, new Date());
        
        await KPISnapshot.findOneAndUpdate(
            { userId, date: today },
            { $set: { ...kpis, date: today } },
            { upsert: true, new: true }
        );
        console.log(`✅ Snapshot generated for user: ${userId}`);
    } catch (err) {
        console.error(`🔥 Snapshot error for user ${userId}:`, err);
    }
};

const generateDailySnapshotsForAll = async () => {
    console.log('🔄 Starting daily KPI snapshots job...');
    const users = await User.find({}).select('_id');
    for (const user of users) {
        await generateSnapshotForUser(user._id);
    }
    console.log('✅ Daily KPI snapshots job completed.');
};

// For Dashboard: Fetch latest or generate if missing
const getLatestSnapshot = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let snapshot = await KPISnapshot.findOne({ userId, date: today });
    if (!snapshot) {
        await generateSnapshotForUser(userId);
        snapshot = await KPISnapshot.findOne({ userId, date: today });
    }
    return snapshot;
};

// Also calculate historical snapshots on demand for chart if needed, 
// but for now we just return the calculation or the db snapshot.

module.exports = {
    calculateUserKPIs,
    generateSnapshotForUser,
    generateDailySnapshotsForAll,
    getLatestSnapshot
};
