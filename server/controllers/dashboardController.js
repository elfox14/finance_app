const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Certificate = require('../models/Certificate');
const Group = require('../models/Group');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // حساب المدخولات والمصروفات
        const incomes = await Income.find({ userId });
        const expenses = await Expense.find({ userId });
        
        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
        const currentBalance = totalIncome - totalExpense;

        // حساب الديون (القروض)
        const loans = await Loan.find({ userId, status: 'نشط' });
        const totalLoanRemaining = loans.reduce((sum, item) => sum + item.remainingAmount, 0);

        // حساب البطاقات
        const cards = await Card.find({ userId, status: 'نشطة' });
        // (حساب بسيط للمثال، سيتم تطويره لاحقاً ليشمل الكشوفات)
        const totalCardUsed = 0; 

        // حساب الشهادات
        const certs = await Certificate.find({ userId, status: 'نشطة' });
        const totalCertValue = certs.reduce((sum, item) => sum + item.principalAmount, 0);

        res.json({
            currentBalance,
            totalIncome,
            totalExpense,
            totalLoanRemaining,
            totalCertValue,
            recentTransactions: [...incomes, ...expenses].sort((a,b) => b.date - a.date).slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
