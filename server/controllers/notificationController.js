const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { PeerDebt } = require('../models/PeerDebt');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [loans, cards, groups, budgets, expenses, incomes, debts] = await Promise.all([
            Loan.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null }),
            Group.find({ userId, deletedAt: null }),
            Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() }),
            Expense.find({ userId, date: { $gte: startOfMonth }, deletedAt: null }),
            Income.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null })
        ]);

        const notifications = [];

        // 🚨 1. تنبيهات حرجة (Critical) - متأخرات
        debts.forEach(d => {
            if (!d.isPaid && d.dueDate && new Date(d.dueDate) < now) {
                notifications.push({
                    priority: 'critical',
                    category: 'debt',
                    msg: `تأخير حرج: مديونية ${d.personName} تجاوزت موعد السداد!`,
                    icon: 'AlertTriangle'
                });
            }
        });

        // ⚠️ 2. تنبيهات متوسطة (Medium) - استحقاقات قريبة
        loans.forEach(l => {
            if (l.nextDueDate && new Date(l.nextDueDate) <= threeDaysFromNow && new Date(l.nextDueDate) >= now) {
                notifications.push({
                    priority: 'medium',
                    category: 'loan',
                    msg: `استحقاق قريب: قسط قرض "${l.loanName}" خلال 3 أيام.`,
                    icon: 'Clock'
                });
            }
        });

        cards.forEach(c => {
            const today = now.getDate();
            if (c.dueDay && Math.abs(c.dueDay - today) <= 3) {
                notifications.push({
                    priority: 'medium',
                    category: 'card',
                    msg: `تذكير بطاقة: موعد سداد بطاقة "${c.cardName}" اقترب (يوم ${c.dueDay}).`,
                    icon: 'CreditCard'
                });
            }
        });

        // ℹ️ 3. تنبيهات معلوماتية (Info) - ميزانيات
        budgets.forEach(b => {
            const spent = expenses.filter(e => e.budgetCategory === b.category).reduce((s, e) => s + e.amount, 0);
            if (spent > b.limit) {
                notifications.push({
                    priority: 'info',
                    category: 'budget',
                    msg: `تجاوز ميزانية: لقد تخطيت ميزانية "${b.category}" المحددة.`,
                    icon: 'TrendingUp'
                });
            }
        });

        // 📉 تنبيه الرصيد المتوقع
        const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
        const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
        if (totalInc - totalExp < 1000) {
            notifications.push({
                priority: 'critical',
                category: 'balance',
                msg: `تحذير سيولة: رصيدك الحالي منخفض جداً، يرجى الحذر في الإنفاق.`,
                icon: 'Zap'
            });
        }

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
