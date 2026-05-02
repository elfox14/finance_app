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

// ──────────────────────────────────────────────────────────
//  Helper: classify a legacy transaction that has no classification field
// ──────────────────────────────────────────────────────────
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
        if (isLinked && ['Loan'].includes(entity) && tx.category?.includes('فوائد')) return 'finance_cost';
        return 'operating_expense';
    }
    return 'operating_expense';
}

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);

        // ════════════════════════════════════════
        // 1. FETCH ALL DATA
        // ════════════════════════════════════════
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

        // Merge legacy into unified
        // First, filter out orphaned transactions linked to deleted entities
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

        const transactionExpenseIds = new Set(transactions.filter(t => t.linkedEntity?.entityType === 'Expense' && t.linkedEntity.entityId).map(t => t.linkedEntity.entityId.toString()));
        const transactionIncomeIds = new Set(transactions.filter(t => t.linkedEntity?.entityType === 'Income' && t.linkedEntity.entityId).map(t => t.linkedEntity.entityId.toString()));

        const unlinkedExpenses = legacyExpenses.filter(e => !transactionExpenseIds.has(e._id.toString()));
        const unlinkedIncomes = legacyIncomes.filter(i => !transactionIncomeIds.has(i._id.toString()));

        const unifiedTransactions = [
            ...activeTransactions,
            ...unlinkedExpenses.map(e => ({ type: 'مصروف', amount: e.amount, date: e.date, category: e.category || e.budgetCategory, status: 'مُسوّى', classification: 'operating_expense', affectsCashflow: true, affectsNetworth: true })),
            ...unlinkedIncomes.map(i => ({ type: 'دخل', amount: i.amount, date: i.date, category: i.source, status: 'مُسوّى', classification: 'operating_income', affectsCashflow: true, affectsNetworth: true }))
        ];

        // Posted transactions only
        const postedTxs = unifiedTransactions.filter(t => ['مُرحَّل', 'مُسوّى'].includes(t.status));
        const monthTxs = postedTxs.filter(t => {
            const d = new Date(t.date);
            return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
        });

        // ════════════════════════════════════════
        // 2. CLASSIFICATION-BASED AGGREGATION
        // ════════════════════════════════════════
        let operatingIncome = 0;
        let operatingExpense = 0;
        let financeCost = 0;
        let financingIn = 0;
        let debtPrincipalPayment = 0;

        // Lists for modals
        const operatingIncomeList = [];
        const operatingExpenseList = [];
        const financeCostList = [];
        const financingInList = [];
        const debtPaymentList = [];

        monthTxs.forEach(tx => {
            const cls = deriveClassification(tx);
            switch (cls) {
                case 'operating_income':
                    operatingIncome += tx.amount;
                    operatingIncomeList.push(tx);
                    break;
                case 'operating_expense':
                    operatingExpense += tx.amount;
                    operatingExpenseList.push(tx);
                    break;
                case 'finance_cost':
                    financeCost += tx.amount;
                    financeCostList.push(tx);
                    break;
                case 'financing_in':
                    financingIn += tx.amount;
                    financingInList.push(tx);
                    break;
                case 'debt_principal_payment':
                    debtPrincipalPayment += tx.amount;
                    debtPaymentList.push(tx);
                    break;
            }
        });

        // ════════════════════════════════════════
        // 3. ROW 1 — ملخص اليوم (Quick Summary)
        // ════════════════════════════════════════

        // 3a. صافي السيولة المتاحة = النقدية + البنك + المحافظ
        const liquidAssets = accounts
            .filter(a => ['نقدي', 'بنكي', 'محفظة_إلكترونية'].includes(a.type))
            .reduce((sum, a) => sum + (a.balance || 0), 0);

        // 3b. صافي التدفق النقدي = إيرادات تشغيلية - مصروفات تشغيلية - فوائد
        const operatingCashFlow = operatingIncome - operatingExpense - financeCost;

        // 3c. صافي الثروة = إجمالي الأصول - إجمالي الالتزامات
        const totalAccountsBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalInvestments = certificates.reduce((sum, c) => sum + (c.principalAmount || 0), 0);
        const totalLentDebts = debts.filter(d => d.type === 'lent' && !d.isPaid).reduce((sum, d) => sum + (d.amount || 0), 0);
        const totalGroupSavings = groups.filter(g => !g.isPaidOut).reduce((sum, g) => sum + (g.paidAmount || 0), 0);
        const totalAssets = totalAccountsBalance + totalInvestments + totalLentDebts + totalGroupSavings;

        const totalLoanBalance = loans.reduce((sum, l) => {
            if (l.remainingAmount != null) return sum + l.remainingAmount;
            return sum + ((l.principalAmount || 0) - (l.paidAmount || 0));
        }, 0);
        const totalCardBalance = cards.filter(c => (c.cardType === 'credit' || c.cardType === 'ائتمانية')).reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        const totalBorrowedDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid).reduce((sum, d) => sum + (d.amount || 0), 0);
        const totalGroupDebt = groups.filter(g => g.isPaidOut && !g.isCompleted).reduce((sum, g) => sum + (g.remainingAmount || 0), 0);
        const totalLiabilities = totalLoanBalance + totalCardBalance + totalBorrowedDebts + totalGroupDebt;

        const netWorth = totalAssets - totalLiabilities;

        // 3d. الالتزامات القائمة (الشهرية المستحقة)
        const activeLoans = loans.filter(l => l.status === 'نشط' && (l.remainingAmount || 0) > 0);
        const activeCards = cards.filter(c => (c.cardType === 'credit' || c.cardType === 'ائتمانية') && (c.currentBalance || 0) > 0);
        const activeGroups = groups.filter(g => !g.isPaidOut);
        const activeBorrowedDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid);

        const outstandingObligations = 
            activeLoans.reduce((s, l) => s + (l.monthlyInstallment || 0), 0) +
            activeCards.reduce((s, c) => s + (c.currentBalance || 0), 0) +
            activeGroups.reduce((s, g) => s + (g.monthlyAmount || 0), 0) +
            activeBorrowedDebts.reduce((s, d) => s + (d.amount || 0), 0);

        // ════════════════════════════════════════
        // 4. ROW 3 — مؤشرات القرار
        // ════════════════════════════════════════

        // 4a. نسبة الادخار
        const savingsRate = operatingIncome > 0 
            ? Number(((operatingCashFlow / operatingIncome) * 100).toFixed(1)) 
            : 0;

        // 4b. نسبة الالتزامات إلى الدخل
        const monthlyDebtPayments = activeLoans.reduce((s, l) => s + (l.monthlyInstallment || 0), 0) + 
                                     activeGroups.reduce((s, g) => s + (g.monthlyAmount || 0), 0);
        const debtToIncomeRatio = operatingIncome > 0 
            ? Number(((monthlyDebtPayments / operatingIncome) * 100).toFixed(1)) 
            : 0;

        // 4c. تغير صافي الثروة (مقارنة بالشهر السابق)
        // Approximate: net worth change = operating cash flow - debt principal (already reduces liabilities)
        const netWorthChange = operatingCashFlow;

        // 4d. التغطية النقدية = السيولة ÷ متوسط المصروفات الشهرية
        // Calculate 3-month average expenses for stability
        const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1);
        const recentExpenses = postedTxs.filter(t => {
            const d = new Date(t.date);
            return d >= threeMonthsAgo && deriveClassification(t) === 'operating_expense';
        });
        const monthsCount = Math.max(1, Math.min(3, Math.ceil((now - threeMonthsAgo) / (30 * 24 * 60 * 60 * 1000))));
        const avgMonthlyExpense = recentExpenses.reduce((s, t) => s + t.amount, 0) / monthsCount;
        const cashCoverageMonths = avgMonthlyExpense > 0 
            ? Number((liquidAssets / avgMonthlyExpense).toFixed(1)) 
            : 0;

        // ════════════════════════════════════════
        // 5. SMART INSIGHTS — قراءة وضعك المالي
        // ════════════════════════════════════════
        const insights = [];

        // Cashflow vs obligations
        if (operatingCashFlow > 0 && financingIn > 0) {
            insights.push('التدفق النقدي هذا الشهر موجب لكن الالتزامات ارتفعت بسبب تمويل جديد.');
        } else if (operatingCashFlow > 0) {
            insights.push('أداء تشغيلي إيجابي — إيراداتك تغطي مصروفاتك وفوائدك.');
        } else if (operatingCashFlow < 0) {
            insights.push('تنبيه: مصروفاتك التشغيلية والفوائد تتجاوز إيراداتك هذا الشهر.');
        }

        // Debt payment impact
        if (debtPrincipalPayment > 0 && financeCost > 0) {
            const ratio = financeCost / (debtPrincipalPayment + financeCost);
            if (ratio > 0.4) {
                insights.push('سدادك هذا الشهر خفّض أصل الدين، لكن تكلفة الفوائد ما زالت مرتفعة.');
            } else {
                insights.push('سدادك هذا الشهر خفّض أصل الدين بفعالية وتكلفة الفوائد معقولة.');
            }
        }

        // Net worth trend
        if (netWorthChange > 0) {
            insights.push('صافي ثروتك يتحسن — الأصول تنمو أسرع من الالتزامات.');
        } else if (netWorthChange < 0) {
            insights.push('صافي ثروتك ينخفض — راجع مصروفاتك وخطة السداد.');
        }

        // Savings rate
        if (savingsRate >= 20) {
            insights.push(`نسبة ادخارك ${savingsRate}% — ممتازة! فوق المعدل الصحي.`);
        } else if (savingsRate >= 0 && savingsRate < 10) {
            insights.push(`نسبة ادخارك ${savingsRate}% — منخفضة. حاول تقليل المصروفات المتغيرة.`);
        }

        // Cash coverage warning
        if (cashCoverageMonths > 0 && cashCoverageMonths < 1) {
            insights.push('تحذير: سيولتك لا تكفي لتغطية شهر واحد من المصروفات.');
        }

        // Budget overspend
        const budgetsResponse = budgets.map(b => {
            const spent = operatingExpenseList.filter(t => t.category === b.category).reduce((sum, t) => sum + t.amount, 0);
            const limit = b.plannedAmount || b.limit || 0;
            return {
                category: b.category,
                limit,
                spent,
                remaining: limit - spent,
                percent: limit > 0 ? Math.round((spent / limit) * 100) : 0
            };
        });

        const overspentBudgets = budgetsResponse.filter(b => b.percent > 100);
        if (overspentBudgets.length > 0) {
            insights.push(`تجاوزت الميزانية في: ${overspentBudgets.map(b => b.category).join('، ')}.`);
        }

        // ════════════════════════════════════════
        // 6. UPCOMING OBLIGATIONS LIST
        // ════════════════════════════════════════
        const upcomingObligationsList = [
            ...activeLoans.map(l => ({ type: 'loan', name: l.loanName, amount: l.monthlyInstallment || 0, dueDate: l.nextPaymentDate || now })),
            ...activeGroups.map(g => ({ type: 'group', name: g.groupName, amount: g.monthlyAmount, dueDate: new Date(now.getFullYear(), now.getMonth(), 28) })),
            ...activeCards.map(c => ({ type: 'card', name: c.cardName, amount: c.currentBalance || 0, dueDate: new Date(now.getFullYear(), now.getMonth(), c.dueDay || 25) })),
            ...activeBorrowedDebts.map(d => ({ type: 'debt', name: `سلفة من ${d.personName}`, amount: d.amount, dueDate: d.dueDate || now }))
        ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

        // ════════════════════════════════════════
        // 7. DETAILED BREAKDOWNS FOR MODALS
        // ════════════════════════════════════════
        const assetsDetailed = [
            ...accounts.map(a => ({ name: a.name, value: a.balance || 0, type: a.type, icon: 'account' })),
            ...certificates.map(c => ({ name: c.certificateName || 'شهادة', value: c.principalAmount, type: 'شهادة', icon: 'certificate' })),
            ...debts.filter(d => d.type === 'lent' && !d.isPaid).map(d => ({ name: `حق طرف ${d.personName}`, value: d.amount, type: 'سلف لك', icon: 'debt' }))
        ].filter(a => a.value > 0).sort((a, b) => b.value - a.value);

        const liabilitiesDetailed = [
            ...activeLoans.map(l => ({ name: l.loanName, value: l.remainingAmount || ((l.principalAmount || 0) - (l.paidAmount || 0)), type: l.loanType || 'قرض', icon: 'loan' })),
            ...activeCards.map(c => ({ name: c.cardName, value: c.currentBalance || 0, type: 'بطاقة ائتمان', icon: 'card' })),
            ...activeBorrowedDebts.map(d => ({ name: `دين لـ ${d.personName}`, value: d.amount, type: 'سلف عليك', icon: 'debt' })),
            ...groups.filter(g => g.isPaidOut && !g.isCompleted).map(g => ({ name: `جمعية: ${g.groupName}`, value: g.remainingAmount || 0, type: 'جمعية', icon: 'debt' }))
        ].filter(l => l.value > 0).sort((a, b) => b.value - a.value);

        // ════════════════════════════════════════
        // 8. CHARTS
        // ════════════════════════════════════════

        // A. 12-Month Operating Cashflow Chart
        const cashflowData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleDateString('ar-EG', { month: 'short' });
            
            const mTxs = postedTxs.filter(t => {
                const txD = new Date(t.date);
                return txD.getMonth() === d.getMonth() && txD.getFullYear() === d.getFullYear();
            });

            let mIncome = 0, mExpense = 0, mFinCost = 0;
            mTxs.forEach(t => {
                const cls = deriveClassification(t);
                if (cls === 'operating_income') mIncome += t.amount;
                if (cls === 'operating_expense') mExpense += t.amount;
                if (cls === 'finance_cost') mFinCost += t.amount;
            });

            cashflowData.push({ month: monthLabel, income: mIncome, expense: mExpense + mFinCost, netProfit: mIncome - mExpense - mFinCost });
        }

        // B. Expense Category Distribution (Operating Only)
        const categoryMap = {};
        operatingExpenseList.forEach(e => {
            const cat = e.category || 'أخرى';
            categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
        });
        const categoryData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] })).sort((a, b) => b.value - a.value);

        // C. Asset Distribution
        const assetDistribution = [];
        accounts.forEach(a => {
            const typeLabel = a.type || 'بنكي';
            const existing = assetDistribution.find(x => x.name === typeLabel);
            if (existing) existing.value += a.balance || 0;
            else assetDistribution.push({ name: typeLabel, value: a.balance || 0 });
        });
        if (totalInvestments > 0) assetDistribution.push({ name: 'شهادات استثمار', value: totalInvestments });

        // ════════════════════════════════════════
        // 9. RESPONSE
        // ════════════════════════════════════════
        res.json({
            // Row 1: ملخص اليوم
            row1: {
                liquidAssets: Math.round(liquidAssets),
                operatingCashFlow: Math.round(operatingCashFlow),
                netWorth: Math.round(netWorth),
                outstandingObligations: Math.round(outstandingObligations)
            },

            // Row 2: أداء الشهر (drivers)
            row2: {
                operatingIncome: Math.round(operatingIncome),
                operatingExpense: Math.round(operatingExpense),
                financingIn: Math.round(financingIn),
                debtPrincipalPayment: Math.round(debtPrincipalPayment),
                financeCost: Math.round(financeCost)
            },

            // Row 3: مؤشرات القرار
            row3: {
                savingsRate,
                debtToIncomeRatio,
                netWorthChange: Math.round(netWorthChange),
                cashCoverageMonths
            },

            // Details for modals
            details: {
                operatingIncomeList: operatingIncomeList.sort((a, b) => new Date(b.date) - new Date(a.date)),
                operatingExpenseList: operatingExpenseList.sort((a, b) => new Date(b.date) - new Date(a.date)),
                financeCostList: financeCostList.sort((a, b) => new Date(b.date) - new Date(a.date)),
                financingInList: financingInList.sort((a, b) => new Date(b.date) - new Date(a.date)),
                debtPaymentList: debtPaymentList.sort((a, b) => new Date(b.date) - new Date(a.date)),
                assetsDetailed,
                liabilitiesDetailed
            },

            // Net worth breakdown
            netWorthBreakdown: {
                totalAssets: Math.round(totalAssets),
                totalLiabilities: Math.round(totalLiabilities)
            },

            // Supplementary
            budgets: budgetsResponse,
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
