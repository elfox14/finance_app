const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const Card = require('../models/Card');
const Certificate = require('../models/Certificate');
const Group = require('../models/Group');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const incomes = await Income.find({ userId }).lean();
        const expenses = await Expense.find({ userId }).lean();
        
        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
        const currentBalance = totalIncome - totalExpense;

        const loans = await Loan.find({ userId, status: 'نشط' });
        const totalLoanRemaining = loans.reduce((sum, item) => sum + item.remainingAmount, 0);

        const certs = await Certificate.find({ userId, status: 'نشطة' });
        const totalCertValue = certs.reduce((sum, item) => sum + item.principalAmount, 0);

        // وسم العمليات بنوعها لضمان عرضها بشكل صحيح في الفرونت
        const taggedIncomes = incomes.map(i => ({ ...i, type: 'income' }));
        const taggedExpenses = expenses.map(e => ({ ...e, type: 'expense' }));

        res.json({
            currentBalance,
            totalIncome,
            totalExpense,
            totalLoanRemaining,
            totalCertValue,
            recentTransactions: [...taggedIncomes, ...taggedExpenses]
                .sort((a,b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: error.message });
    }
};
