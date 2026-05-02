const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const { PeerDebt } = require('../models/PeerDebt');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Certificate = require('../models/Certificate');

class DashboardService {
    async getSummary(userId) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const [
            transactions, legacyExpenses, legacyIncomes,
            accounts, loans, cards, debts, 
            groups, budgets, certificates
        ] = await Promise.all([
            Transaction.find({ userId, deletedAt: null }),
            Expense.find({ userId }),
            Income.find({ userId, deletedAt: null }),
            Account.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null }),
            Group.find({ userId, deletedAt: null }),
            Budget.find({ userId, month: currentMonth, year: currentYear }),
            Certificate.find({ userId, status: 'active' })
        ]);

        const unifiedTransactions = [
            ...transactions,
            ...legacyExpenses.map(e => ({ type: 'مصروف', amount: e.amount, date: e.date, category: e.category || e.budgetCategory, status: 'مُسوّى', classification: 'operating_expense', affectsCashflow: true, affectsNetworth: true })),
            ...legacyIncomes.map(i => ({ type: 'دخل', amount: i.amount, date: i.date, category: i.source, status: 'مُسوّى', classification: 'operating_income', affectsCashflow: true, affectsNetworth: true }))
        ];

        const postedTxs = unifiedTransactions.filter(t => ['مُرحَّل', 'مُسوّى'].includes(t.status));
        const monthTxs = postedTxs.filter(t => {
            const d = new Date(t.date);
            return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        });

        const aggregated = this._aggregateClassificationData(monthTxs);
        const liquidAssets = this._calculateLiquidAssets(accounts);
        const netWorthData = this._calculateNetWorth(accounts, certificates, debts, groups, loans, cards);
        const obligations = this._calculateOutstandingObligations(loans, cards, groups, debts);
        
        const operatingCashFlow = aggregated.operatingIncome - aggregated.operatingExpense - aggregated.financeCost;
        const savingsRate = aggregated.operatingIncome > 0 ? (operatingCashFlow / aggregated.operatingIncome) * 100 : 0;
        const cashCoverage = this._calculateCashCoverage(liquidAssets, postedTxs);

        return {
            period: { month: currentMonth, year: currentYear },
            summary: {
                liquidAssets: Math.round(liquidAssets),
                operatingCashFlow: Math.round(operatingCashFlow),
                netWorth: Math.round(netWorthData.netWorth),
                outstandingObligations: Math.round(obligations)
            },
            performance: {
                operatingIncome: Math.round(aggregated.operatingIncome),
                operatingExpense: Math.round(aggregated.operatingExpense),
                financingIn: Math.round(aggregated.financingIn),
                debtPrincipalPayment: Math.round(aggregated.debtPrincipalPayment),
                financeCost: Math.round(aggregated.financeCost)
            },
            ratios: {
                savingsRate: Number(savingsRate.toFixed(1)),
                debtToIncomeRatio: this._calculateDebtToIncome(aggregated.operatingIncome, loans, groups),
                cashCoverageMonths: cashCoverage,
                netWorthChange: Math.round(operatingCashFlow)
            },
            details: {
                operatingIncomeList: aggregated.operatingIncomeList,
                operatingExpenseList: aggregated.operatingExpenseList,
                financeCostList: aggregated.financeCostList,
                financingInList: aggregated.financingInList,
                debtPaymentList: aggregated.debtPaymentList,
                assetsDetailed: netWorthData.assetsDetailed,
                liabilitiesDetailed: netWorthData.liabilitiesDetailed
            },
            insights: this._generateInsights(operatingCashFlow, savingsRate, cashCoverage, netWorthData.netWorth),
            upcomingObligations: this._getUpcomingObligations(loans, groups, cards, debts),
            netWorthBreakdown: {
                totalAssets: netWorthData.assets,
                totalLiabilities: netWorthData.liabilities
            }
        };
    }

    _aggregateClassificationData(txs) {
        let results = {
            operatingIncome: 0, operatingExpense: 0, financeCost: 0, 
            financingIn: 0, debtPrincipalPayment: 0,
            operatingIncomeList: [], operatingExpenseList: [], financeCostList: [],
            financingInList: [], debtPaymentList: []
        };

        txs.forEach(tx => {
            const cls = this._deriveClassification(tx);
            if (results[cls] !== undefined) results[cls] += tx.amount;
            if (results[`${cls}List`] !== undefined) results[`${cls}List`].push(tx);
        });

        return results;
    }

    _deriveClassification(tx) {
        if (tx.classification) return tx.classification;
        if (tx.type === 'دخل' || tx.type === 'income') return 'operating_income';
        if (tx.type === 'مصروف' || tx.type === 'expense') {
            if (tx.category?.includes('فوائد')) return 'finance_cost';
            return 'operating_expense';
        }
        return 'operating_expense';
    }

    _calculateLiquidAssets(accounts) {
        return accounts
            .filter(a => ['نقدي', 'بنكي', 'محفظة_إلكترونية', 'bank', 'cash', 'wallet'].includes(a.type))
            .reduce((sum, a) => sum + (a.balance || 0), 0);
    }

    _calculateNetWorth(accounts, certificates, debts, groups, loans, cards) {
        const assetsDetailed = [
            ...accounts.map(a => ({ name: a.name, value: a.balance || 0, type: a.type, icon: 'account' })),
            ...certificates.map(c => ({ name: c.certificateName || 'شهادة استثمار', value: c.principalAmount, type: 'شهادة', icon: 'certificate' })),
            ...debts.filter(d => d.type === 'lent' && !d.isPaid).map(d => ({ name: `حق طرف ${d.personName}`, value: d.amount, type: 'سلف لك', icon: 'debt' }))
        ].filter(a => a.value > 0);

        const liabilitiesDetailed = [
            ...loans.map(l => ({ name: l.lenderName || 'قرض', value: l.remainingBalance || 0, type: 'قرض', icon: 'loan' })),
            ...cards.filter(c => c.cardType === 'credit').map(c => ({ name: c.cardName, value: c.currentBalance || 0, type: 'بطاقة ائتمان', icon: 'card' })),
            ...debts.filter(d => d.type === 'borrowed' && !d.isPaid).map(d => ({ name: `دين لـ ${d.personName}`, value: d.amount, type: 'سلف عليك', icon: 'debt' }))
        ].filter(l => l.value > 0);

        const assets = assetsDetailed.reduce((s, a) => s + a.value, 0);
        const liabilities = liabilitiesDetailed.reduce((s, l) => s + l.value, 0);

        return { assets, liabilities, netWorth: assets - liabilities, assetsDetailed, liabilitiesDetailed };
    }

    _calculateOutstandingObligations(loans, cards, groups, debts) {
        return loans.reduce((s, l) => s + (l.monthlyInstallment || 0), 0) +
               groups.reduce((s, g) => s + (g.monthlyAmount || 0), 0);
    }

    _calculateDebtToIncome(income, loans, groups) {
        if (income <= 0) return 0;
        const payments = loans.reduce((s, l) => s + (l.monthlyInstallment || 0), 0) +
                         groups.reduce((s, g) => s + (g.monthlyAmount || 0), 0);
        return Number(((payments / income) * 100).toFixed(1));
    }

    _calculateCashCoverage(liquid, txs) {
        const expenses = txs.filter(t => this._deriveClassification(t) === 'operating_expense');
        const avgExpense = expenses.length > 0 ? (expenses.reduce((s, t) => s + t.amount, 0) / 1) : 0; // Simple 1 month for now
        return avgExpense > 0 ? Number((liquid / avgExpense).toFixed(1)) : 0;
    }

    _generateInsights(cashFlow, savingsRate, coverage, netWorth) {
        const insights = [];
        if (cashFlow > 0) insights.push('أداء تشغيلي إيجابي — إيراداتك تغطي مصروفاتك بالكامل.');
        else insights.push('تنبيه: مصروفاتك تتجاوز إيراداتك هذا الشهر. راجع أولوياتك.');
        
        if (savingsRate >= 20) insights.push(`نسبة ادخارك ${savingsRate.toFixed(1)}% — هذا ممتاز ويفوق المعدل العالمي.`);
        if (coverage < 1) insights.push('تحذير: سيولتك الحالية لا تغطي مصروفات شهر واحد. حاول بناء صندوق طوارئ.');
        if (netWorth > 0) insights.push('صافي ثروتك إيجابي، مما يعني أن أصولك أكبر من ديونك.');
        
        return insights;
    }

    _getUpcomingObligations(loans, groups, cards, debts) {
        const now = new Date();
        return [
            ...loans.map(l => ({ type: 'loan', name: l.lenderName, amount: l.monthlyInstallment, dueDate: l.nextPaymentDate || now })),
            ...groups.map(g => ({ type: 'group', name: g.groupName, amount: g.monthlyAmount, dueDate: now }))
        ].sort((a, b) => a.dueDate - b.dueDate).slice(0, 5);
    }
}

module.exports = new DashboardService();
