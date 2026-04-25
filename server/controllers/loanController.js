const Loan = require('../models/Loan');

// @desc    Get all loans
exports.getLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create loan
exports.createLoan = async (req, res) => {
    try {
        // حساب المبلغ المتبقي ليكون مساوياً لإجمالي المبلغ المطلوب سداده في البداية
        const loanData = {
            ...req.body,
            userId: req.user._id,
            remainingAmount: req.body.totalPayable
        };
        const loan = await Loan.create(loanData);
        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete loan
exports.deleteLoan = async (req, res) => {
    try {
        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() },
            { new: true }
        );
        res.json({ message: 'تم حذف القرض بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
