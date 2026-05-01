const Group = require('../models/Group');
const GroupPayment = require('../models/GroupPayment');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// @desc    Get all groups with status analysis
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ userId: req.user._id, deletedAt: null });
        const payments = await GroupPayment.find({ userId: req.user._id, deletedAt: null });

        const groupsWithAnalytics = groups.map(group => {
            const groupPayments = payments.filter(p => p.groupId.toString() === group._id.toString());
            const totalPaid = groupPayments.reduce((sum, p) => sum + p.amount, 0);
            
            // حساب تاريخ القبض المتوقع
            const payoutDate = new Date(group.startDate);
            payoutDate.setMonth(payoutDate.getMonth() + (group.userPayoutOrder - 1));

            return {
                ...group._doc,
                analytics: {
                    totalPaid,
                    payoutDate,
                    remainingToPay: (group.monthlyAmount * group.durationMonths) - totalPaid,
                    netPosition: group.isPaidOut ? (group.totalAmount - totalPaid) : (-totalPaid),
                    monthsPaid: groupPayments.length,
                    monthsRemaining: group.durationMonths - groupPayments.length
                }
            };
        });

        res.json(groupsWithAnalytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record group payment
exports.recordGroupPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId, amount, accountId, date } = req.body;
        
        const payment = await GroupPayment.create({ ...req.body, userId });
        const group = await Group.findById(groupId);

        // 1. Accounting Transaction
        if (accountId) {
            await Transaction.create({
                userId,
                date: date || new Date(),
                type: 'سداد',
                amount: Number(amount),
                accountId: accountId,
                category: `قسط جمعية: ${group.groupName}`,
                notes: `دفع قسط شهر لجمعية ${group.groupName}`,
                status: 'مُسوّى',
                // Logic: if already paid out, it's debt payment. If not, it's asset acquisition (saving)
                classification: group.isPaidOut ? 'debt_principal_payment' : 'asset_acquisition',
                affectsCashflow: false,
                affectsNetworth: group.isPaidOut ? false : true,
                linkedEntity: { entityType: 'Group', entityId: group._id }
            });

            // 2. Update Account Balance
            const account = await Account.findById(accountId);
            if (account) {
                account.balance -= Number(amount);
                await account.save();
            }
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create group
exports.createGroup = async (req, res) => {
    try {
        const group = await Group.create({ ...req.body, userId: req.user._id });
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update group (Including Payout Trigger)
exports.updateGroup = async (req, res) => {
    try {
        const userId = req.user._id;
        const oldGroup = await Group.findOne({ _id: req.params.id, userId });
        
        const group = await Group.findOneAndUpdate(
            { _id: req.params.id, userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!group) return res.status(404).json({ message: 'الجمعية غير موجودة' });

        // Handle Payout Event: if isPaidOut changed from false to true
        if (!oldGroup.isPaidOut && group.isPaidOut && req.body.payoutAccountId) {
            // 1. Transaction record for payout
            await Transaction.create({
                userId,
                date: new Date(),
                type: 'دخل',
                amount: group.totalAmount,
                accountId: req.body.payoutAccountId,
                category: `قبض جمعية: ${group.groupName}`,
                notes: `استلام مبلغ الجمعية بالكامل`,
                status: 'مُسوّى',
                classification: 'financing_in', // Acts as financing
                affectsCashflow: false,
                affectsNetworth: false,
                linkedEntity: { entityType: 'Group', entityId: group._id }
            });

            // 2. Update Balance
            const account = await Account.findById(req.body.payoutAccountId);
            if (account) {
                account.balance += group.totalAmount;
                await account.save();
            }
        }

        res.json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete group
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!group) return res.status(404).json({ message: 'الجمعية غير موجودة' });
        res.json({ message: 'تم حذف الجمعية' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
