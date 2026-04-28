const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Certificate = require('../models/Certificate');
const { PeerDebt } = require('../models/PeerDebt');
const Budget = require('../models/Budget');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();

        // Fetch all relevant operational data
        const [
            transactions, accounts, loans, cards, 
            certificates, debts, budgets
        ] = await Promise.all([
            Transaction.find({ userId, deletedAt: null }),
            Account.find({ userId, deletedAt: null }),
            Loan.find({ userId, deletedAt: null, status: 'نشط' }),
            Card.find({ userId, deletedAt: null }),
            Certificate.find({ userId, status: 'active' }),
            PeerDebt.find({ userId, deletedAt: null }),
            Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() })
        ]);

        const alerts = [];
        const opportunities = [];

        // --- 1. ALERTS (تنبيهات ومخاطر) ---

        // 1.1 Uncategorized / Unreconciled Transactions
        const uncategorizedCount = transactions.filter(t => t.status === 'غير مصنف' || t.status === 'مصنف').length;
        if (uncategorizedCount > 0) {
            alerts.push({
                id: 'uncat_' + Date.now(),
                type: 'alert',
                severity: 'medium',
                entity_type: 'transaction',
                message: `لديك ${uncategorizedCount} حركة مالية غير مرحلة للدفتر أو غير مصنفة.`,
                suggested_action: 'قم بمراجعة الدفتر الموحد واعتماد العمليات.',
                icon: 'AlertCircle',
                color: 'text-amber-500',
                bgColor: 'bg-amber-500/10'
            });
        }

        // 1.2 Account Discrepancy
        accounts.forEach(acc => {
            const difference = (acc.statementBalance || 0) - acc.balance;
            if (Math.abs(difference) > 0) {
                alerts.push({
                    id: 'diff_' + acc._id,
                    type: 'alert',
                    severity: 'critical',
                    entity_type: 'account',
                    message: `يوجد فرق تسوية بقيمة ${Math.abs(difference).toLocaleString()} ج.م في حساب ${acc.name}.`,
                    suggested_action: 'راجع التسوية البنكية وكشف الحساب الأخير.',
                    icon: 'ShieldAlert',
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10'
                });
            }
        });

        // 1.3 Budget Overspend
        const monthExpenses = transactions.filter(t => t.type === 'مصروف' && new Date(t.date) >= startOfMonth && ['مُرحَّل', 'مُسوّى'].includes(t.status));
        budgets.forEach(b => {
            const spent = monthExpenses.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0);
            const planned = b.plannedAmount || b.limit;
            if (spent > planned) {
                alerts.push({
                    id: 'budget_' + b._id,
                    type: 'alert',
                    severity: 'critical',
                    entity_type: 'budget',
                    message: `تجاوزت الموازنة المحددة لفئة "${b.category}" بعجز قدره ${(spent - planned).toLocaleString()} ج.م.`,
                    suggested_action: 'قلل إنفاقك في هذه الفئة لبقية الشهر أو قم بتعديل الموازنة.',
                    icon: 'TrendingUp',
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10'
                });
            }
        });

        // 1.4 Upcoming Obligations (Next 5 Days)
        const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        loans.forEach(l => {
            if (l.nextPaymentDate && new Date(l.nextPaymentDate) <= fiveDaysFromNow && new Date(l.nextPaymentDate) >= now) {
                alerts.push({
                    id: 'loan_' + l._id,
                    type: 'alert',
                    severity: 'medium',
                    entity_type: 'loan',
                    message: `قسط قرض "${l.loanName}" بقيمة ${l.monthlyPayment.toLocaleString()} ج.م يستحق خلال أيام.`,
                    suggested_action: 'تأكد من وجود سيولة كافية في حسابك البنكي.',
                    icon: 'Landmark',
                    color: 'text-amber-500',
                    bgColor: 'bg-amber-500/10'
                });
            }
        });

        cards.filter(c => c.cardType === 'credit' && c.currentBalance > 0).forEach(c => {
            let dueD = new Date(now.getFullYear(), now.getMonth(), c.dueDay);
            if (dueD < now) dueD = new Date(now.getFullYear(), now.getMonth() + 1, c.dueDay);
            if (dueD <= fiveDaysFromNow) {
                alerts.push({
                    id: 'card_' + c._id,
                    type: 'alert',
                    severity: 'critical',
                    entity_type: 'card',
                    message: `سداد بطاقة "${c.cardName}" بقيمة ${c.currentBalance.toLocaleString()} ج.م مستحق قريباً.`,
                    suggested_action: 'قم بسداد المديونية لتجنب الفوائد الإضافية.',
                    icon: 'CreditCard',
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10'
                });
            }
        });


        // --- 2. OPPORTUNITIES (فرص وتوجيهات) ---

        // 2.1 Surplus Cash
        const totalCash = accounts.reduce((s, a) => s + (a.balance || 0), 0);
        const monthlyIncomes = transactions.filter(t => t.type === 'دخل' && new Date(t.date) >= startOfMonth && ['مُرحَّل', 'مُسوّى'].includes(t.status));
        const avgIncome = monthlyIncomes.reduce((s, i) => s + i.amount, 0) || 5000; // fallback
        
        if (totalCash > avgIncome * 1.5) {
            opportunities.push({
                id: 'opp_cash_' + Date.now(),
                type: 'opportunity',
                entity_type: 'account',
                message: `لديك سيولة نقدية فائضة بقيمة أعلى من متوسط دخلك الشهري.`,
                suggested_action: 'فكر في ربط وديعة، استثمار الفائض، أو سداد التزاماتك مبكراً.',
                icon: 'TrendingUp',
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10'
            });
        }

        // 2.2 Certificate Maturing Soon (Next 14 Days)
        const fourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        certificates.forEach(c => {
            if (c.maturityDate && new Date(c.maturityDate) <= fourteenDays) {
                opportunities.push({
                    id: 'opp_cert_' + c._id,
                    type: 'opportunity',
                    entity_type: 'certificate',
                    message: `شهادة الاستثمار "${c.bankName}" ستستحق قريباً بقيمة ${c.principalAmount.toLocaleString()} ج.م.`,
                    suggested_action: 'حدد ما إذا كنت ترغب في تجديدها أو إعادة توجيه الأموال.',
                    icon: 'Sparkles',
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-500/10'
                });
            }
        });

        // 2.3 Budget Underspend (Mid-month Check)
        if (currentDay > 15 && currentDay < daysInMonth - 2) {
            budgets.forEach(b => {
                const spent = monthExpenses.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0);
                const planned = b.plannedAmount || b.limit;
                if (planned > 0 && (spent / planned) < 0.4) {
                    opportunities.push({
                        id: 'opp_budget_' + b._id,
                        type: 'opportunity',
                        entity_type: 'budget',
                        message: `معدل إنفاقك في فئة "${b.category}" بطيء جداً (أقل من 40%) رغم انتصاف الشهر.`,
                        suggested_action: 'يمكنك تخفيض الموازنة المخصصة لهذه الفئة الشهر القادم لتوفير سيولة أكبر.',
                        icon: 'PieChart',
                        color: 'text-blue-500',
                        bgColor: 'bg-blue-500/10'
                    });
                }
            });
        }

        res.json({
            alerts,
            opportunities,
            summary: {
                criticalCount: alerts.filter(a => a.severity === 'critical').length,
                opportunitiesCount: opportunities.length
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
