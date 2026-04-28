const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc Get all accounts with reconciliation stats
exports.getAccounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await Account.find({ userId, deletedAt: null }).sort({ createdAt: -1 });

        const enrichedAccounts = await Promise.all(accounts.map(async acc => {
            // Find all transactions involving this account
            const txs = await Transaction.find({ 
                userId, 
                deletedAt: null,
                $or: [{ accountId: acc._id }, { destinationAccountId: acc._id }] 
            });

            // Compute true ledger balance: Opening + In - Out
            let ledgerBalance = acc.openingBalance || 0;
            let pendingTransfers = 0;
            let unReconciledCount = 0;

            txs.forEach(tx => {
                const isSource = String(tx.accountId) === String(acc._id);
                const isDest = String(tx.destinationAccountId) === String(acc._id);

                if (tx.status === 'مُسوّى' || tx.status === 'مُرحَّل') {
                    if (isSource) {
                        if (tx.type === 'مصروف' || tx.type === 'سداد' || tx.type === 'تحويل') ledgerBalance -= tx.amount;
                        if (tx.type === 'دخل') ledgerBalance += tx.amount; // Though usually income is destination
                    }
                    if (isDest && tx.type === 'تحويل') {
                        ledgerBalance += tx.amount;
                    }
                } else {
                    // Pending / Uncategorized
                    if (tx.type === 'تحويل' && isDest) pendingTransfers += tx.amount;
                    if (tx.status !== 'مُسوّى') unReconciledCount++;
                }
            });

            // Update cached balance if needed (self-healing)
            if (acc.balance !== ledgerBalance && (txs.length > 0 || acc.openingBalance)) {
                acc.balance = ledgerBalance;
                await acc.save();
            }

            return {
                ...acc.toObject(),
                analytics: {
                    ledgerBalance,
                    statementBalance: acc.statementBalance || 0,
                    unReconciledCount,
                    pendingTransfers,
                    difference: (acc.statementBalance || 0) - ledgerBalance
                }
            };
        }));

        const totalLedgerBalance = enrichedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        const totalStatementBalance = enrichedAccounts.reduce((sum, acc) => sum + (acc.statementBalance || 0), 0);

        res.json({ 
            accounts: enrichedAccounts, 
            totalBalance: totalLedgerBalance,
            totalStatementBalance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Create new account
exports.createAccount = async (req, res) => {
    try {
        const { openingBalance, ...rest } = req.body;
        const account = await Account.create({ 
            ...rest, 
            openingBalance: Number(openingBalance || 0),
            balance: Number(openingBalance || 0),
            statementBalance: Number(openingBalance || 0),
            userId: req.user._id 
        });
        res.status(201).json(account);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Update account
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

// @desc Reconcile account with bank statement
exports.reconcileAccount = async (req, res) => {
    try {
        const { statementBalance, reconciliationDate } = req.body;
        const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (!account) return res.status(404).json({ message: 'الحساب غير موجود' });

        account.statementBalance = Number(statementBalance);
        account.lastReconciliationDate = reconciliationDate || new Date();
        await account.save();

        res.json({ message: 'تم التحديث بنجاح', account });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete account
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
