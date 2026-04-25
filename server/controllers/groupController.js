const Group = require('../models/Group');
const GroupPayment = require('../models/GroupPayment');

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
        const payment = await GroupPayment.create({ ...req.body, userId: req.user._id });
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

// @desc    Update group
exports.updateGroup = async (req, res) => {
    try {
        const group = await Group.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!group) return res.status(404).json({ message: 'الجمعية غير موجودة' });
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
