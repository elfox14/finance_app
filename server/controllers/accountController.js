const Account = require('../models/Account');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

// @desc Get all accounts with calculated stats
exports.getAccounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await Account.find({ userId, deletedAt: null });

        // حساب إجمالي المصروفات والدخل لكل حساب
        const [allExpenses, allIncomes] = await Promise.all([
            Expense.find({ userId, deletedAt: null }),
            Income.find({ userId, deletedAt: null })
        ]);

        const enrichedAccounts = accounts.map(acc => {
            const accExpenses = allExpenses.filter(e => e.paymentSource === acc.type || e.account === acc.name);
            const accIncomes = allIncomes.filter(i => i.account === acc.name);

            const totalIn = accIncomes.reduce((s, i) => s + i.amount, 0);
            const totalOut = accExpenses.reduce((s, e) => s + e.amount, 0);

            return {
                ...acc.toObject(),
                analytics: {
                    totalIn,
                    totalOut,
                    transactionCount: accExpenses.length + accIncomes.length
                }
            };
        });

        // إجمالي الرصيد عبر جميع الحسابات
        const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

        res.json({ accounts: enrichedAccounts, totalBalance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Create new account
exports.createAccount = async (req, res) => {
    try {
        const account = await Account.create({ ...req.body, userId: req.user._id });
        res.status(201).json(account);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Update account (e.g., adjust balance manually)
exports.updateAccount = async (req, res) => {
    try {
        const account = await Account.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!account) return res.status(404).json({ message: 'الحساب غير موجود' });
        res.json(account);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete account (soft delete)
exports.deleteAccount = async (req, res) => {
    try {
        await Account.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        res.json({ message: 'تم حذف الحساب بنجاح' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Adjust account balance (deposit/withdraw)
exports.adjustBalance = async (req, res) => {
    try {
        const { amount, type } = req.body; // type: 'deposit' | 'withdraw'
        const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });
        if (!account) return res.status(404).json({ message: 'الحساب غير موجود' });

        account.balance += type === 'deposit' ? Number(amount) : -Number(amount);
        await account.save();
        res.json(account);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
