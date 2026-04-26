const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const { PeerDebt } = require('../models/PeerDebt'); // تصحيح الاستيراد هنا
const Group = require('../models/Group');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 1. جلب البيانات الخام
        const [allExpenses, allIncomes, loans, cards, debts, groups] = await Promise.all([
            Expense.find({ user: userId }),
            Income.find({ user: userId }),
            Loan.find({ user: userId }),
            Card.find({ user: userId }),
            PeerDebt.find({ user: userId, isPaid: false }),
            Group.find({ user: userId, status: 'active' })
        ]);

        // 2. فلترة بيانات الشهر الحالي
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

        // 3. المحور الثاني: الالتزامات (30 يوم)
        const activeLoans = loans.filter(l => (l.status === 'نشط' || l.status === 'active') && (l.remainingAmount || 0) > 0);
        const upcomingLoans = activeLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
        
        const activeCards = cards.filter(c => (c.status === 'نشطة' || c.status === 'active') && (c.analytics?.currentBalance || 0) > 0);
        const upcomingCards = activeCards.reduce((sum, c) => sum + (c.analytics?.currentBalance || 0), 0);
        
        const upcomingGroups = groups.reduce((sum, g) => sum + (g.monthlyAmount || 0), 0);
        const upcomingDebts = debts.filter(d => d.type === 'borrowed').reduce((sum, d) => sum + (d.amount || 0), 0);

        const total30DayObligations = upcomingLoans + upcomingCards + upcomingGroups + upcomingDebts;

        // 4. المحور الثالث: الأصول والسيولة (تراكمي)
        const totalReceived = allIncomes.filter(i => i.cashFlowType === 'received').reduce((sum, i) => sum + i.amount, 0);
        const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const currentBalance = totalReceived - totalSpent;
        const availableBalance = currentBalance - total30DayObligations;

        // 5. المحور الخامس: المؤشرات الموحدة
        const savingsRateRaw = expectedIncome > 0 ? ((expectedIncome - totalExpenses) / expectedIncome) * 100 : 0;
        const dtiRaw = expectedIncome > 0 ? (total30DayObligations / expectedIncome) * 100 : 0;
        const cardUsageRaw = activeCards.length > 0 
            ? (activeCards.reduce((sum, c) => sum + (c.analytics?.currentBalance || 0), 0) / activeCards.reduce((sum, c) => sum + (c.creditLimit || 1), 0)) * 100 
            : 0;

        const indicators = {
            savingsRate: Number(savingsRateRaw.toFixed(1)),
            debtToIncomeRatio: Number(dtiRaw.toFixed(1)),
            cardUsageRatio: Number(cardUsageRaw.toFixed(1)),
            hasOverdue: total30DayObligations > currentBalance
        };

        // 6. التحليل التنفيذي (Executive Summary)
        const distribution = {};
        currentMonthExpenses.forEach(e => {
            distribution[e.category] = (distribution[e.category] || 0) + e.amount;
        });

        const topExpenseCategory = Object.keys(distribution).sort((a, b) => distribution[b] - distribution[a])[0] || 'لا يوجد';
        
        const executiveSummary = {
            text: availableBalance >= 0 
                ? "وضعك المالي مستقر حالياً، لديك سيولة تغطي التزاماتك القادمة." 
                : "تنبيه: السيولة الحالية لا تغطي التزامات الشهر، يرجى إعادة ترتيب الأولويات.",
            mainInsight: `أعلى بند صرف: ${topExpenseCategory}`
        };

        // 7. التنبيهات وسجل التحركات
        const alerts = [];
        if (indicators.hasOverdue) alerts.push({ type: 'danger', message: 'عجز في السيولة لتغطية الالتزامات' });
        if (indicators.cardUsageRatio > 70) alerts.push({ type: 'warning', message: 'استهلاك مرتفع للبطاقة الائتمانية' });
        if (activeLoans.length > 3) alerts.push({ type: 'info', message: 'تعدد القروض النشطة قد يؤثر على الادخار' });

        const recentActions = [
            ...allIncomes.map(i => ({ id: i._id, type: 'income', amount: i.amount, displayLabel: i.source, date: i.date })),
            ...allExpenses.map(e => ({ id: e._id, type: 'expense', amount: e.amount, displayLabel: e.category, date: e.date }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        // الاستجابة الموحدة النهائية (بناءً على اقتراحك)
        res.json({
            topStats: {
                currentBalance: Math.max(0, currentBalance),
                availableBalance,
                total30DayObligations,
                expectedIncome,
                expectedExpense: totalExpenses,
                healthScore: Math.max(0, 100 - (indicators.debtToIncomeRatio * 0.5) - (availableBalance < 0 ? 40 : 0))
            },
            indicators,
            executiveSummary,
            alerts: alerts.slice(0, 3),
            upcomingObligations: [
                ...activeLoans.map(l => ({ name: `قسط قرض: ${l.loanName}`, amount: l.monthlyInstallment || 0, date: l.nextPaymentDate || l.firstDueDate, category: 'loan' })),
                ...groups.map(g => ({ name: `قسط جمعية: ${g.groupName}`, amount: g.monthlyAmount, date: now, category: 'group' })),
                ...activeCards.map(c => ({ name: `سداد بطاقة: ${c.cardName}`, amount: c.analytics?.currentBalance || 0, date: now, category: 'card' }))
            ].slice(0, 5),
            distribution,
            recentActions
        });

    } catch (err) {
        console.error('🔥 Dashboard Final Response Error:', err);
        res.status(500).json({ message: 'خطأ في تجميع البيانات النهائية' });
    }
};
