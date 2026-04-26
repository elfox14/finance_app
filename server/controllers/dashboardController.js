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

        // 1) التدفقات النقدية (Incomes & Expenses)
        const incomes = await Income.find({ user: userId });
        const expenses = await Expense.find({ user: userId });

        const thisMonthIncomes = incomes.filter(inc => new Date(inc.date) >= firstDayOfMonth);
        const totalReceivedThisMonth = thisMonthIncomes
            .filter(inc => inc.cashFlowType === 'received')
            .reduce((sum, inc) => sum + inc.amount, 0);

        // حساب الدخل المتوقع لـ 30 يوم قادمة
        const expectedIncome30Days = incomes
            .filter(inc => inc.cashFlowType === 'accrued' && new Date(inc.date) >= now)
            .reduce((sum, inc) => sum + inc.amount, 0);

        // حساب متوسط الدخل الشهري ونسبة الثبات
        const totalIncomeAllTime = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const fixedIncomeTotal = incomes.filter(inc => inc.incomeType === 'fixed').reduce((sum, inc) => sum + inc.amount, 0);
        
        // حساب عدد الشهور النشطة
        const uniqueMonths = [...new Set(incomes.map(inc => {
            const d = new Date(inc.date);
            return `${d.getFullYear()}-${d.getMonth()}`;
        }))].length || 1;

        const avgMonthlyIncome = totalIncomeAllTime / uniqueMonths;
        const incomeStabilityRatio = totalIncomeAllTime > 0 ? (fixedIncomeTotal / totalIncomeAllTime) * 100 : 0;

        // 2) الالتزامات (Loans, Cards, Debts, Groups)
        const loans = await Loan.find({ user: userId });
        const cards = await Card.find({ user: userId });
        const peerDebts = await PeerDebt.find({ user: userId, type: 'borrowed' });
        const groups = await Group.find({ user: userId });

        const totalObligations = 
            loans.reduce((sum, l) => sum + (l.analytics?.remainingTotal || 0), 0) +
            cards.reduce((sum, c) => sum + (c.analytics?.currentBalance || 0), 0) +
            peerDebts.reduce((sum, d) => sum + (d.analytics?.remainingAmount || 0), 0) +
            groups.reduce((sum, g) => sum + (g.analytics?.remainingPosition || 0), 0);

        // 3) الحقوق والأصول
        const lentDebts = await PeerDebt.find({ user: userId, type: 'lent' });
        const totalAssets = 
            totalReceivedThisMonth + 
            lentDebts.reduce((sum, d) => sum + (d.analytics?.remainingAmount || 0), 0);

        // 4) توزيع المصاريف للرسم البياني
        const distribution = {};
        expenses.forEach(exp => {
            distribution[exp.category] = (distribution[exp.category] || 0) + exp.amount;
        });

        res.json({
            topStats: {
                currentBalance: totalReceivedThisMonth, // الرصيد الفعلي المتاح هذا الشهر
                totalAssets,
                totalObligations,
                healthScore: Math.max(0, 100 - (totalObligations / (totalIncomeAllTime || 1) * 100)).toFixed(0),
                
                // المؤشرات الجديدة التي طلبتها (المحور الأول)
                incomeThisMonth: totalReceivedThisMonth,
                expectedIncome30Days,
                avgMonthlyIncome: avgMonthlyIncome.toFixed(0),
                incomeStabilityRatio: incomeStabilityRatio.toFixed(0),
                cardUsageRatio: cards.length > 0 ? (cards.reduce((s, c) => s + (c.analytics?.usagePercent || 0), 0) / cards.length).toFixed(0) : 0
            },
            healthFactors: {
                savingsRate: totalReceivedThisMonth > 0 ? (((totalReceivedThisMonth - expenses.reduce((s, e) => s + e.amount, 0)) / totalReceivedThisMonth) * 100).toFixed(0) : 0,
                debtRatio: totalIncomeAllTime > 0 ? (totalObligations / totalIncomeAllTime * 100).toFixed(0) : 0,
                liquidityScore: 85 // قيمة تجريبية سيتم ربطها لاحقاً
            },
            distribution
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
