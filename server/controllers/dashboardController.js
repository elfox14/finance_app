const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Card = require('../models/Card');
const Loan = require('../models/Loan');
const Group = require('../models/Group');
const Certificate = require('../models/Certificate');
const PeerDebt = require('../models/PeerDebt');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // جلب جميع البيانات المتوازية لتحسين الأداء
        const [expenses, incomes, loans, groups, peerDebts, certs, cards] = await Promise.all([
            Expense.find({ userId, deletedAt: null }),
            Income.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null }),
            Group.find({ userId, deletedAt: null }),
            PeerDebt.find({ userId, deletedAt: null }),
            Certificate.find({ userId, deletedAt: null }),
            Card.find({ userId, deletedAt: null })
        ]);

        // 1. الحسابات الأساسية
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const currentBalance = totalIncome - totalExpense;

        // 2. طبقة السيولة والالتزامات (هذا الشهر)
        const monthlyLiabilities = [
            ...loans.map(l => l.monthlyInstallment || 0),
            ...groups.map(g => g.monthlyInstallment || 0)
        ].reduce((a, b) => a + b, 0);

        const availableAfterLiabilities = currentBalance - monthlyLiabilities;

        // 3. طبقة الديون والجودة
        const totalDebtRemaining = loans.reduce((sum, l) => sum + (l.totalPayable - (l.paidAmount || 0)), 0);
        const debtToIncomeRatio = totalIncome > 0 ? (totalDebtRemaining / totalIncome) * 100 : 0;

        // أعلى 5 بنود استهلاك
        const topExpenses = [...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(e => ({ note: e.note, amount: e.amount }));

        // 4. طبقة التحذيرات (Warnings)
        const warnings = [];
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // تحذيرات القروض والجمعيات القريبة
        loans.forEach(l => {
            if (l.nextDueDate && new Date(l.nextDueDate) <= thirtyDaysFromNow) {
                warnings.push({ type: 'loan', msg: `قسط قرض "${l.loanName}" مستحق قريباً`, date: l.nextDueDate });
            }
        });

        cards.forEach(c => {
            if (c.dueDay) {
                warnings.push({ type: 'card', msg: `موعد سداد بطاقة "${c.cardName}" يوم ${c.dueDay} من الشهر` });
            }
        });

        peerDebts.forEach(p => {
            if (p.type === 'lent' && !p.isPaid) {
                warnings.push({ type: 'peer', msg: `تذكير: لم تسترد مبلغ ${p.amount} من ${p.personName}` });
            }
        });

        // تجميع العمليات الأخيرة للجدول
        const recentTransactions = [
            ...expenses.map(e => ({ ...e._doc, type: 'expense' })),
            ...incomes.map(i => ({ ...i._doc, type: 'income' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        res.json({
            // أ. وضع السيولة
            liquidity: {
                currentBalance,
                availableAfterLiabilities,
                monthlyLiabilities,
                status: availableAfterLiabilities > 0 ? 'safe' : 'critical'
            },
            // ب. وضع الديون
            debt: {
                totalDebtRemaining,
                debtToIncomeRatio: debtToIncomeRatio.toFixed(1),
                installmentsCount: loans.length + groups.length
            },
            // ج. جودة الإنفاق
            quality: {
                totalIncome,
                totalExpense,
                topExpenses,
                expenseRate: totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0
            },
            // د. التحذيرات والعمليات
            warnings: warnings.slice(0, 5),
            recentTransactions,
            totalCertValue: certs.reduce((sum, c) => sum + c.principalAmount, 0)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
