const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const PeerDebt = require('../models/PeerDebt');
const Group = require('../models/Group');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // جلب البيانات الخام من قاعدة البيانات
        const [incomes, expenses, loans, cards, peerDebts, groups] = await Promise.all([
            Income.find({ user: userId }),
            Expense.find({ user: userId }),
            Loan.find({ user: userId }),
            Card.find({ user: userId }),
            PeerDebt.find({ user: userId }),
            Group.find({ user: userId })
        ]);

        // حساب المدخولات
        const totalReceivedAllTime = incomes
            .filter(inc => inc.cashFlowType === 'received')
            .reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);

        const totalExpectedIncome = incomes
            .filter(inc => inc.cashFlowType === 'accrued')
            .reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);

        const incomeThisMonth = incomes
            .filter(inc => new Date(inc.date) >= firstDayOfMonth && inc.cashFlowType === 'received')
            .reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);

        // حساب المصروفات
        const totalExpensesAllTime = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        const expensesThisMonth = expenses
            .filter(exp => new Date(exp.date) >= firstDayOfMonth)
            .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

        // حساب الالتزامات (المحور الثاني)
        const currentLoanObligations = loans.reduce((sum, l) => sum + (Number(l.analytics?.remainingTotal) || 0), 0);
        const currentCardObligations = cards.reduce((sum, c) => sum + (Number(c.analytics?.currentBalance) || 0), 0);
        const currentBorrowedDebts = peerDebts
            .filter(d => d.type === 'borrowed')
            .reduce((sum, d) => sum + (Number(d.analytics?.remainingAmount) || 0), 0);
        
        const totalObligations = currentLoanObligations + currentCardObligations + currentBorrowedDebts;

        // حساب الأصول (المحور الثالث)
        const currentLentDebts = peerDebts
            .filter(d => d.type === 'lent')
            .reduce((sum, d) => sum + (Number(d.analytics?.remainingAmount) || 0), 0);

        // الرصيد الفعلي = إجمالي المقبوض - إجمالي المصروف
        const currentActualBalance = totalReceivedAllTime - totalExpensesAllTime;

        // حساب متوسط الدخل ونسبة الثبات
        const uniqueMonths = [...new Set(incomes.map(inc => {
            const d = new Date(inc.date);
            return `${d.getFullYear()}-${d.getMonth()}`;
        }))].length || 1;

        const fixedIncomeTotal = incomes.filter(inc => inc.incomeType === 'fixed').reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
        
        // توزيع المصاريف للرسم البياني
        const distribution = {};
        expenses.forEach(exp => {
            distribution[exp.category] = (distribution[exp.category] || 0) + (Number(exp.amount) || 0);
        });

        res.json({
            topStats: {
                currentBalance: currentActualBalance, 
                totalAssets: currentActualBalance + currentLentDebts,
                totalObligations: totalObligations,
                healthScore: Math.max(0, 100 - (totalObligations / (totalReceivedAllTime || 1) * 100)).toFixed(0),
                
                incomeThisMonth: incomeThisMonth,
                expectedIncome30Days: totalExpectedIncome,
                avgMonthlyIncome: (totalReceivedAllTime / uniqueMonths).toFixed(0),
                incomeStabilityRatio: totalReceivedAllTime > 0 ? ((fixedIncomeTotal / totalReceivedAllTime) * 100).toFixed(0) : 0,
                cardUsageRatio: cards.length > 0 ? (cards.reduce((s, c) => s + (Number(c.analytics?.usagePercent) || 0), 0) / cards.length).toFixed(0) : 0
            },
            healthFactors: {
                savingsRate: totalReceivedAllTime > 0 ? (((totalReceivedAllTime - totalExpensesAllTime) / totalReceivedAllTime) * 100).toFixed(0) : 0,
                debtRatio: totalReceivedAllTime > 0 ? (totalObligations / totalReceivedAllTime * 100).toFixed(0) : 0,
                liquidityScore: 75
            },
            distribution
        });
    } catch (err) {
        console.error('🔥 Dashboard Error:', err);
        res.status(500).json({ message: err.message });
    }
};
