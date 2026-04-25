const PeerDebt = require('../models/PeerDebt');

// @desc    Get all peer debts
exports.getPeerDebts = async (req, res) => {
    try {
        const debts = await PeerDebt.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create peer debt
exports.createPeerDebt = async (req, res) => {
    try {
        const debt = await PeerDebt.create({ ...req.body, userId: req.user._id });
        res.status(201).json(debt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Toggle status (نشط / مسدد)
exports.toggleStatus = async (req, res) => {
    try {
        const debt = await PeerDebt.findOne({ _id: req.params.id, userId: req.user._id });
        if (!debt) return res.status(404).json({ message: 'العملية غير موجودة' });
        
        debt.status = debt.status === 'نشط' ? 'مسدد' : 'نشط';
        await debt.save();
        res.json(debt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete peer debt
exports.deletePeerDebt = async (req, res) => {
    try {
        await PeerDebt.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        res.json({ message: 'تم المسح بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
