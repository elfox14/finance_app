const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Certificate = require('../models/Certificate');
const PeerDebt = require('../models/PeerDebt');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // تنفيذ كل الطلبات بالتوازي لسرعة الأداء
        const [incomes, expenses, loans, cards, certs, peerDebts] = await Promise.all([
            Income.find({ userId }).lean(),
            Expense.find({ userId }).lean(),
            Loan.find({ userId, status: 'نشط' }).lean(),
            Card.find({ userId, status: 'نشطة' }).lean(),
            Certificate.find({ userId, status: 'نشطة' }).lean(),
            PeerDebt.find({ userId, status: 'نشط' }).lean()
        ]);
        
        const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        // حساب السلف والتسليف في الحسبة الإجمالية (اختياري حسب رغبتك)
        const totalBorrowed = peerDebts.filter(d => d.type === 'borrowed').reduce((s, i) => s + i.amount, 0);
        const totalLent = peerDebts.filter(d => d.type === 'lent').reduce((s, i) => s + i.amount, 0);

        const currentBalance = totalIncome - totalExpense;

        const totalLoanRemaining = loans.reduce((sum, item) => sum + (item.remainingAmount || 0), 0) + totalBorrowed;
        const totalCertValue = certs.reduce((sum, item) => sum + (item.principalAmount || 0), 0) + totalLent;

        // وسم العمليات بنوعها
        const taggedIncomes = incomes.map(i => ({ ...i, type: 'income' }));
        const taggedExpenses = expenses.map(e => ({ ...e, type: 'expense' }));
        const taggedPeer = peerDebts.map(p => ({ ...p, type: p.type === 'borrowed' ? 'expense' : 'income' }));

        res.json({
            currentBalance,
            totalIncome,
            totalExpense,
            totalLoanRemaining,
            totalCertValue,
            recentTransactions: [...taggedIncomes, ...taggedExpenses, ...taggedPeer]
                .sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                .slice(0, 8)
        });
    } catch (error) {
        console.error('🔥 Dashboard Error:', error);
        res.status(500).json({ message: 'خطأ في معالجة بيانات لوحة التحكم' });
    }
};
