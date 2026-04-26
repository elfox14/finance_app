const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Group = require('../models/Group');
const { PeerDebt } = require('../models/PeerDebt');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [incomes, expenses, loans, cards, groups, debts] = await Promise.all([
            Income.find({ userId, deletedAt: null }),
            Expense.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            Group.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null })
        ]);

        // 1. حسابات الدخل والمصروف
        const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
        const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
        const currentBalance = totalIncome - totalExpense;

        // 2. الدخل والمصروف المتوقع (Expected)
        const expectedIncome = incomes.filter(i => i.isRecurring).reduce((s, i) => s + i.amount, 0) || totalIncome;
        const expectedExpense = expenses.filter(e => e.isRecurring).reduce((s, e) => s + e.amount, 0) || totalExpense;

        // 3. التزامات 30 يوم
        const upcomingLoans = loans.reduce((s, l) => s + l.monthlyInstallment, 0);
        const upcomingGroups = groups.reduce((s, g) => s + g.monthlyAmount, 0);
        const upcomingDebts = debts.filter(d => d.type === 'borrowed' && !d.isPaid && d.dueDate && new Date(d.dueDate).getMonth() === now.getMonth()).reduce((s, d) => s + d.amount, 0);
        const total30DayObligations = upcomingLoans + upcomingGroups + upcomingDebts;

        const availableBalance = currentBalance - total30DayObligations;

        // 🧠 4. خوارزمية مؤشر الصحة المالية (Score 0-100)
        let healthScore = 100;
        
        // أ. نسبة الالتزام للدخل (Penalty if > 40%)
        const dti = totalIncome > 0 ? (total30DayObligations / (totalIncome / 12 || 1)) : 0;
        if (dti > 0.4) healthScore -= 20;
        else if (dti > 0.2) healthScore -= 10;

        // ب. معدل الادخار (Bonus if > 20%)
        const savingsRate = totalIncome > 0 ? (currentBalance / totalIncome) : 0;
        if (savingsRate < 0.1) healthScore -= 15;
        else if (savingsRate > 0.3) healthScore += 5;

        // ج. وجود متأخرات (Heavy Penalty)
        const hasOverdue = debts.some(d => !d.isPaid && d.dueDate && new Date(d.dueDate) < now);
        if (hasOverdue) healthScore -= 25;

        // د. استخدام البطاقات (Penalty if > 70%)
        // (سنفترض وجود استهلاك عالي إذا كان الرصيد المتاح سالباً)
        if (availableBalance < 0) healthScore -= 20;

        healthScore = Math.max(0, Math.min(100, healthScore));

        // --- 🧠 ذكاء مالي: التنبيهات وما يحتاج انتباه ---
        const alerts = [];
        if (availableBalance < 0) alerts.push({ type: 'danger', message: 'التزاماتك تتجاوز رصيدك الحالي' });
        if (dti > 0.5) alerts.push({ type: 'warning', message: 'عبء الديون مرتفع جداً (تجاوز 50%)' });
        
        // التحقق من القروض والديون القريبة
        const upcomingItems = [
            ...loans.filter(l => !l.isPaid).map(l => ({ name: `قسط قرض: ${l.loanName}`, amount: l.monthlyPayment, date: l.nextPaymentDate, category: 'loan' })),
            ...cards.filter(c => c.currentBalance > 0).map(c => ({ name: `مستحق بطاقة: ${c.cardName}`, amount: c.currentBalance, date: new Date(now.getFullYear(), now.getMonth(), c.dueDay), category: 'card' })),
            ...debts.filter(d => d.type === 'borrowed' && !d.isPaid).map(d => ({ name: `دين لـ: ${d.personName}`, amount: d.amount, date: d.dueDate, category: 'debt' }))
        ].filter(item => item.date && new Date(item.date) >= now)
         .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingItems.length > 0) {
            const nearest = upcomingItems[0];
            const daysLeft = Math.ceil((new Date(nearest.date) - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3) alerts.push({ type: 'info', message: `لديك ${nearest.name} مستحق خلال ${daysLeft} أيام` });
        }

        // --- 📝 الملخص التنفيذي الذكي ---
        let summaryText = "وضعك المالي مستقر بشكل عام.";
        if (savingsRate < 0.1) summaryText = "تحذير: نسبة الادخار منخفضة جداً، حاول تقليل المصاريف الكمالية.";
        if (availableBalance > currentBalance * 0.5) summaryText = "ممتاز! لديك سيولة جيدة جداً بعد تغطية الالتزامات.";

        res.json({
            topStats: {
                currentBalance,
                availableBalance,
                totalObligations: total30DayObligations,
                expectedIncome,
                expectedExpense,
                healthScore,
                savingsRate: (savingsRate * 100).toFixed(1)
            },
            executiveSummary: {
                text: summaryText,
                mainInsight: `أعلى بند صرف: ${Object.entries(expenses.reduce((acc, e) => {
                    acc[e.budgetCategory] = (acc[e.budgetCategory] || 0) + e.amount;
                    return acc;
                }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'}`
            },
            alerts: alerts.slice(0, 3),
            healthFactors: {
                savings: { label: 'الادخار', score: Math.min(100, (savingsRate / 0.2) * 100).toFixed(0) },
                debt: { label: 'الالتزامات', score: Math.max(0, (1 - dti) * 100).toFixed(0) },
                liquidity: { label: 'السيولة', score: availableBalance > 0 ? 100 : 0 }
            },
            upcomingObligations: upcomingItems.slice(0, 5),
            distribution: expenses.reduce((acc, e) => {
                const cat = e.budgetCategory || e.category || 'أخرى';
                acc[cat] = (acc[cat] || 0) + e.amount;
                return acc;
            }, {}),
            recentActions: [...expenses, ...incomes]
                .map(item => ({
                    ...item._doc || item,
                    type: item.amount > 0 && incomes.some(inc => inc._id.toString() === item._id.toString()) ? 'income' : 'expense'
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
