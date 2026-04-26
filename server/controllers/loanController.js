const Loan = require('../models/Loan');
const LoanPayment = require('../models/LoanPayment');
const Income = require('../models/Income');

// @desc    Get all loans with deep debt analysis
exports.getLoans = async (req, res) => {
    try {
        const userId = req.user._id;
        const [loans, payments, incomes] = await Promise.all([
            Loan.find({ userId, deletedAt: null }),
            LoanPayment.find({ userId, deletedAt: null }),
            Income.find({ userId, deletedAt: null })
        ]);

        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

        const loansWithAnalytics = loans.map(loan => {
            const loanPayments = payments.filter(p => p.loanId.toString() === loan._id.toString());
            const paidAmount = loanPayments.reduce((sum, p) => sum + p.amount, 0);
            const remainingTotal = loan.totalPayable - paidAmount;
            const progressPercent = ((paidAmount / loan.totalPayable) * 100).toFixed(1);

            // حساب عبء الدين من الدخل
            const debtBurden = totalIncome > 0 ? ((loan.monthlyInstallment / (totalIncome / 12 || 1)) * 100).toFixed(1) : 0;

            return {
                ...loan._doc,
                analytics: {
                    paidAmount,
                    remainingTotal,
                    progressPercent,
                    debtBurden,
                    installmentsPaid: loanPayments.length,
                    installmentsRemaining: (loan.durationMonths || 0) - loanPayments.length
                },
                payments: loanPayments.sort((a, b) => a.installmentNumber - b.installmentNumber)
            };
        });

        res.json(loansWithAnalytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record loan payment
exports.recordPayment = async (req, res) => {
    try {
        const payment = await LoanPayment.create({ ...req.body, userId: req.user._id });
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create loan
exports.createLoan = async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user._id };
        
        // حساب القيم الناقصة إذا لم يرسلها الفرونت إند
        if (!data.totalPayable) data.totalPayable = data.principalAmount;
        if (!data.remainingAmount) data.remainingAmount = data.totalPayable;
        if (data.startPaymentDate) data.startDate = data.startPaymentDate;
        
        const loan = await Loan.create(data);
        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update loan
exports.updateLoan = async (req, res) => {
    try {
        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!loan) return res.status(404).json({ message: 'القرض غير موجود' });
        res.json(loan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete loan
exports.deleteLoan = async (req, res) => {
    try {
        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!loan) return res.status(404).json({ message: 'القرض غير موجود' });
        res.json({ message: 'تم حذف القرض' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
