const Loan = require('../models/Loan');
const LoanInstallment = require('../models/LoanInstallment');
const LoanPayment = require('../models/LoanPayment');
const Income = require('../models/Income');

// @desc    Get all loans with deep debt analysis
exports.getLoans = async (req, res) => {
    try {
        const userId = req.user._id;
        const [loans, incomes] = await Promise.all([
            Loan.find({ userId, deletedAt: null }),
            Income.find({ userId, deletedAt: null })
        ]);

        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

        const loansWithAnalytics = loans.map(loan => {
            const paidAmount = loan.paidAmount || 0;
            const remainingTotal = loan.totalPayable - paidAmount;
            const progressPercent = ((paidAmount / loan.totalPayable) * 100).toFixed(1);

            // حساب عبء الدين (DTI)
            const debtBurden = totalIncome > 0 ? ((loan.monthlyInstallment / totalIncome) * 100).toFixed(1) : 0;

            return {
                ...loan._doc,
                analytics: {
                    paidAmount,
                    remainingTotal,
                    progressPercent,
                    debtBurden
                }
            };
        });

        const stats = {
            totalPrincipal: loans.reduce((s, l) => s + l.principalAmount, 0),
            totalRemaining: loans.reduce((s, l) => s + (l.totalPayable - l.paidAmount), 0),
            totalPaid: loans.reduce((s, l) => s + l.paidAmount, 0),
            monthlyTotal: loans.reduce((s, l) => s + l.monthlyInstallment, 0),
            overallDTI: totalIncome > 0 ? ((loans.reduce((s, l) => s + l.monthlyInstallment, 0) / totalIncome) * 100).toFixed(1) : 0
        };

        res.json({ loans: loansWithAnalytics, stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create loan and generate installment schedule
exports.createLoan = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = { ...req.body, userId };
        
        // 1. Calculate Financials
        // If interest rate is provided, calculate total payable
        if (data.interestRate && !data.totalPayable) {
            const interestAmount = data.principalAmount * (data.interestRate / 100);
            data.totalPayable = data.principalAmount + interestAmount;
            data.monthlyInstallment = data.totalPayable / data.durationMonths;
        }

        if (!data.totalPayable) data.totalPayable = data.principalAmount;
        if (!data.remainingAmount) data.remainingAmount = data.totalPayable;
        
        // Set firstDueDate if not provided
        if (!data.firstDueDate) {
            const d = new Date();
            d.setMonth(d.getMonth() + 1);
            d.setDate(data.dueDay || 1);
            data.firstDueDate = d;
        }
        data.nextPaymentDate = data.firstDueDate;

        // 2. Create Loan
        const loan = await Loan.create(data);

        // 3. Generate Installment Schedule
        const installments = [];
        for (let i = 1; i <= data.durationMonths; i++) {
            const dueDate = new Date(data.firstDueDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            
            installments.push({
                userId,
                loanId: loan._id,
                installmentNumber: i,
                dueDate,
                amount: data.monthlyInstallment,
                status: 'unpaid'
            });
        }
        await LoanInstallment.insertMany(installments);

        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get loan details (Schedule & Payments)
exports.getLoanDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const [installments, payments] = await Promise.all([
            LoanInstallment.find({ userId, loanId: id, deletedAt: null }).sort({ installmentNumber: 1 }),
            LoanPayment.find({ userId, loanId: id, deletedAt: null }).sort({ paymentDate: -1 })
        ]);

        res.json({ installments, payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record loan payment and update schedule
exports.recordPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { loanId, installmentId, amount, paymentDate, paymentType, sourceAccount, note } = req.body;

        // 1. Create Payment
        const payment = await LoanPayment.create({
            userId, loanId, installmentId, amount, paymentDate, paymentType, sourceAccount, note
        });

        // 2. Update Installment if specific ID provided
        if (installmentId) {
            await LoanInstallment.findByIdAndUpdate(installmentId, {
                status: 'paid',
                paymentDate: paymentDate || new Date()
            });
        }

        // 3. Update Loan Stats
        const loan = await Loan.findById(loanId);
        loan.paidAmount += Number(amount);
        loan.remainingAmount -= Number(amount);

        // Update nextPaymentDate to the next unpaid installment
        const nextUnpaid = await LoanInstallment.findOne({ 
            loanId, 
            status: 'unpaid' 
        }).sort({ installmentNumber: 1 });
        
        if (nextUnpaid) {
            loan.nextPaymentDate = nextUnpaid.dueDate;
        } else {
            loan.status = 'منتهٍ';
        }

        await loan.save();
        res.status(201).json(payment);
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
