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
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 1. جلب كافة البيانات الخام
        const [expenses, incomes, loans, cards, debts, groups] = await Promise.all([
            Expense.find({ user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
            Income.find({ user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
            Loan.find({ user: userId, status: 'active' }),
            Card.find({ user: userId }),
            PeerDebt.find({ user: userId, isPaid: false }),
            Group.find({ user: userId, status: 'active' })
        ]);

        // 2. حساب التدفقات النقدية (Cash Flows)
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomeReceived = incomes.filter(i => i.cashFlowType === 'received').reduce((sum, i) => sum + i.amount, 0);
        const expectedIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

        // 3. حساب الالتزامات (Obligations - 30 Days)
        let total30DayObligations = 0;
        
        // أقساط القروض (استخدام الحقل الصحيح monthlyInstallment)
        const loanInstallments = loans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
        
        // مديونيات البطاقات (المستحق سداده)
        const cardPayments = cards.reduce((sum, c) => sum + (c.analytics?.currentBalance || 0), 0);
        
        // أقساط الجمعيات
        const groupPayments = groups.reduce((sum, g) => sum + (g.monthlyAmount || 0), 0);
        
        // الديون الشخصية المستحقة قريباً (Borrowed)
        const personalDebts = debts.filter(d => d.type === 'borrowed').reduce((sum, d) => sum + (d.amount || 0), 0);

        total30DayObligations = loanInstallments + cardPayments + groupPayments + personalDebts;

        // 4. حساب الأصول والسيولة (Assets & Liquidity)
        const bankBalance = incomes.filter(i => i.account === 'bank').reduce((sum, i) => sum + i.amount, 0) - 
                           expenses.filter(e => e.account === 'bank').reduce((sum, e) => sum + e.amount, 0);
        
        const cashBalance = incomes.filter(i => i.account === 'cash').reduce((sum, i) => sum + i.amount, 0) - 
                           expenses.filter(e => e.account === 'cash').reduce((sum, e) => sum + e.amount, 0);

        const currentBalance = bankBalance + cashBalance;
        const availableBalance = currentBalance - total30DayObligations;

        // 5. حساب مؤشرات الأداء (Indicators)
        const savingsRate = expectedIncome > 0 ? ((expectedIncome - totalExpenses) / expectedIncome) * 100 : 0;
        const debtToIncomeRatio = expectedIncome > 0 ? (total30DayObligations / expectedIncome) * 100 : 0;
        
        // حساب الصحة المالية (معادلة تجريبية)
        let healthScore = 100;
        if (debtToIncomeRatio > 50) healthScore -= 30;
        if (availableBalance < 0) healthScore -= 40;
        if (savingsRate < 10) healthScore -= 20;

        // 6. توزيع المصروفات (Distribution)
        const distribution = {};
        expenses.forEach(e => {
            distribution[e.category] = (distribution[e.category] || 0) + e.amount;
        });

        // 7. تجميع الاستجابة الموحدة (Unified Response)
        res.json({
            topStats: {
                currentBalance: Math.max(0, currentBalance),
                availableBalance: availableBalance,
                total30DayObligations: total30DayObligations,
                expectedIncome: expectedIncome,
                expectedExpense: totalExpenses + total30DayObligations, // المصاريف العادية + الالتزامات الثابتة
                healthScore: Math.max(0, healthScore)
            },
            indicators: {
                savingsRate: Math.round(savingsRate),
                debtToIncomeRatio: Math.round(debtToIncomeRatio),
                hasOverdue: total30DayObligations > currentBalance
            },
            distribution,
            recentActions: expenses.slice(0, 5).map(e => ({
                id: e._id,
                type: 'expense',
                amount: e.amount,
                category: e.category,
                date: e.date
            })),
            upcomingObligations: [
                ...loans.map(l => ({ name: `قسط: ${l.loanName}`, amount: l.monthlyInstallment, type: 'loan' })),
                ...groups.map(g => ({ name: `جمعية: ${g.groupName}`, amount: g.monthlyAmount, type: 'group' }))
            ].slice(0, 5)
        });

    } catch (err) {
        console.error('🔥 Dashboard Error:', err);
        res.status(500).json({ message: 'خطأ في تجميع بيانات لوحة التحكم' });
    }
};
