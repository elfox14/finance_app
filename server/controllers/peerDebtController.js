const { PeerDebt, PeerDebtPayment } = require('../models/PeerDebt');

// @desc    Get all peer debts with ledger analysis
exports.getPeerDebts = async (req, res) => {
    try {
        const userId = req.user._id;
        const [debts, payments] = await Promise.all([
            PeerDebt.find({ userId, deletedAt: null }),
            PeerDebtPayment.find({ userId })
        ]);

        const now = new Date();

        const debtsWithAnalytics = debts.map(debt => {
            const debtPayments = payments.filter(p => p.debtId.toString() === debt._id.toString());
            const paidAmount = debtPayments.reduce((sum, p) => sum + p.amount, 0);
            const remainingAmount = debt.amount - paidAmount;
            
            // حساب أيام التأخير
            let delayDays = 0;
            if (!debt.isPaid && debt.dueDate && new Date(debt.dueDate) < now) {
                const diffTime = Math.abs(now - new Date(debt.dueDate));
                delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return {
                ...debt._doc,
                analytics: {
                    paidAmount,
                    remainingAmount,
                    delayDays,
                    lastPaymentDate: debtPayments.sort((a, b) => b.date - a.date)[0]?.date || null
                }
            };
        });

        // إحصائيات عامة
        const stats = {
            totalLentRemaining: debtsWithAnalytics.filter(d => d.type === 'lent' && !d.isPaid).reduce((s, d) => s + d.analytics.remainingAmount, 0),
            totalBorrowedRemaining: debtsWithAnalytics.filter(d => d.type === 'borrowed' && !d.isPaid).reduce((s, d) => s + d.analytics.remainingAmount, 0),
            overdueCount: debtsWithAnalytics.filter(d => d.analytics.delayDays > 0).length
        };

        res.json({ debts: debtsWithAnalytics, stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record partial payment
exports.recordPayment = async (req, res) => {
    try {
        const { debtId, amount } = req.body;
        const payment = await PeerDebtPayment.create({ ...req.body, userId: req.user._id });
        
        // تحقق إذا تم سداد السلفة بالكامل
        const debt = await PeerDebt.findById(debtId);
        const allPayments = await PeerDebtPayment.find({ debtId });
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        
        if (totalPaid >= debt.amount) {
            debt.isPaid = true;
            await debt.save();
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create peer debt
exports.createPeerDebt = async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user._id };
        if (data.dueDate === '') data.dueDate = null;
        const debt = await PeerDebt.create(data);
        res.status(201).json(debt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update peer debt
exports.updatePeerDebt = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.dueDate === '') data.dueDate = null;
        const debt = await PeerDebt.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            data,
            { new: true, runValidators: true }
        );
        if (!debt) return res.status(404).json({ message: 'السلفة غير موجودة' });
        res.json(debt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete peer debt
exports.deletePeerDebt = async (req, res) => {
    try {
        const debt = await PeerDebt.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!debt) return res.status(404).json({ message: 'السلفة غير موجودة' });
        res.json({ message: 'تم الحذف' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
