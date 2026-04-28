const Loan = require('../models/Loan');
const LoanInstallment = require('../models/LoanInstallment');
const LoanPayment = require('../models/LoanPayment');
const Transaction = require('../models/Transaction');

// @desc    Get all loans with deep debt analysis
exports.getLoans = async (req, res) => {
    try {
        const userId = req.user._id;
        const loans = await Loan.find({ userId, deletedAt: null }).populate('receivingAccountId', 'name');
        
        let totalPrincipal = 0;
        let totalRemaining = 0;
        let totalMonthlyInstallments = 0;
        let totalInterestPaid = 0;
        let totalArrears = 0;

        // Populate upcoming installments for the dashboard timeline
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 2);

        const allUpcomingInstallments = await LoanInstallment.find({
            userId,
            status: { $in: ['unpaid', 'late'] },
            dueDate: { $lte: nextMonth }
        }).populate('loanId', 'loanName lenderName').sort({ dueDate: 1 }).limit(10);

        const loansWithAnalytics = await Promise.all(loans.map(async (loan) => {
            const payments = await LoanPayment.find({ loanId: loan._id });
            const interestPaidThisLoan = payments.reduce((sum, p) => sum + (p.interestPaid || 0), 0);
            const principalPaidThisLoan = payments.reduce((sum, p) => sum + (p.principalPaid || 0), 0);

            const remainingPrincipal = loan.principalAmount - principalPaidThisLoan;
            
            // Check arrears (متأخرات)
            const lateInstallments = await LoanInstallment.find({
                loanId: loan._id,
                status: 'unpaid',
                dueDate: { $lt: now }
            });
            const arrearsAmount = lateInstallments.reduce((sum, inst) => sum + inst.amount, 0);

            totalPrincipal += loan.principalAmount;
            totalRemaining += remainingPrincipal;
            totalMonthlyInstallments += loan.monthlyInstallment;
            totalInterestPaid += interestPaidThisLoan;
            totalArrears += arrearsAmount;

            return {
                ...loan._doc,
                analytics: {
                    principalPaid: principalPaidThisLoan,
                    interestPaid: interestPaidThisLoan,
                    remainingPrincipal,
                    arrearsAmount,
                    progressPercent: loan.principalAmount > 0 ? ((principalPaidThisLoan / loan.principalAmount) * 100).toFixed(1) : 0
                }
            };
        }));

        res.json({
            loans: loansWithAnalytics,
            upcomingInstallments: allUpcomingInstallments,
            stats: {
                totalPrincipal,
                totalRemaining,
                totalMonthlyInstallments,
                totalInterestPaid,
                totalArrears
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create loan and generate installment schedule
exports.createLoan = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = { ...req.body, userId };
        
        const principal = Number(data.principalAmount);
        const rate = Number(data.interestRate || 0);
        const months = Number(data.durationMonths);

        if (rate > 0 && !data.totalPayable) {
            const interestAmount = principal * (rate / 100);
            data.totalPayable = principal + interestAmount;
        }

        if (!data.totalPayable) data.totalPayable = principal;
        data.totalPayable = Number(data.totalPayable);

        if (!data.monthlyInstallment || data.monthlyInstallment === 0) {
            data.monthlyInstallment = data.totalPayable / months;
        } else {
            data.monthlyInstallment = Number(data.monthlyInstallment);
        }

        data.remainingAmount = data.totalPayable;
        
        if (!data.firstDueDate) {
            const d = new Date();
            d.setMonth(d.getMonth() + 1);
            d.setDate(data.dueDay || 1);
            data.firstDueDate = d;
        }
        data.nextPaymentDate = data.firstDueDate;

        // 1. Create Loan Liability
        const loan = await Loan.create(data);

        // 2. Generate Installments Schedule
        const installments = [];
        const principalPerMonth = principal / months;
        const interestPerMonth = (data.totalPayable - principal) / months;

        for (let i = 1; i <= months; i++) {
            const dueDate = new Date(data.firstDueDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            
            installments.push({
                userId,
                loanId: loan._id,
                installmentNumber: i,
                dueDate,
                amount: data.monthlyInstallment,
                principalPart: principalPerMonth,
                interestPart: interestPerMonth,
                status: 'unpaid'
            });
        }
        await LoanInstallment.insertMany(installments);

        // 3. Register Transaction (Increase Account Balance + Record Liability)
        if (data.receivingAccountId) {
            await Transaction.create({
                userId,
                date: data.startDate || new Date(),
                type: 'التزام', // Liability received (acts like cash inflow)
                amount: principal,
                accountId: data.receivingAccountId,
                category: 'قروض مستلمة',
                counterparty: data.lenderName,
                status: 'مُسوّى',
                notes: `استلام قرض: ${data.loanName}`,
                linkedEntity: { entityType: 'Loan', entityId: loan._id }
            });
        }

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
            LoanPayment.find({ userId, loanId: id, deletedAt: null }).populate('sourceAccountId', 'name').sort({ paymentDate: -1 })
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
        const { loanId, installmentId, amount, principalPaid, interestPaid, paymentDate, sourceAccountId, note } = req.body;

        // 1. Create Payment Record
        const payment = await LoanPayment.create({
            userId, loanId, installmentId, 
            amount: Number(amount), 
            principalPaid: Number(principalPaid || 0), 
            interestPaid: Number(interestPaid || 0), 
            paymentDate, sourceAccountId, note
        });

        // 2. Update Installment
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

        const nextUnpaid = await LoanInstallment.findOne({ loanId, status: 'unpaid' }).sort({ installmentNumber: 1 });
        if (nextUnpaid) {
            loan.nextPaymentDate = nextUnpaid.dueDate;
        } else {
            loan.status = 'منتهٍ';
        }
        await loan.save();

        // 4. Create Accounting Transactions (Principal as Liability Reduction, Interest as Expense)
        if (sourceAccountId) {
            const txDate = paymentDate || new Date();
            const counterparty = loan.lenderName;

            // Principal Reduction (سداد التزام)
            if (Number(principalPaid) > 0) {
                await Transaction.create({
                    userId, date: txDate, type: 'سداد', amount: Number(principalPaid),
                    accountId: sourceAccountId, category: 'سداد قروض', counterparty,
                    status: 'مُسوّى', notes: `سداد أصل قرض: ${loan.loanName} ${note ? '- '+note : ''}`,
                    linkedEntity: { entityType: 'Loan', entityId: loan._id }
                });
            }

            // Interest Paid (مصروف فوائد)
            if (Number(interestPaid) > 0) {
                await Transaction.create({
                    userId, date: txDate, type: 'مصروف', amount: Number(interestPaid),
                    accountId: sourceAccountId, category: 'فوائد قروض', counterparty,
                    status: 'مُسوّى', notes: `سداد فوائد قرض: ${loan.loanName}`,
                    linkedEntity: { entityType: 'Loan', entityId: loan._id }
                });
            }

            // If no explicit split was provided, just record as a single payment transaction
            if (!principalPaid && !interestPaid) {
                await Transaction.create({
                    userId, date: txDate, type: 'سداد', amount: Number(amount),
                    accountId: sourceAccountId, category: 'سداد قروض', counterparty,
                    status: 'مُسوّى', notes: `سداد قسط قرض: ${loan.loanName}`,
                    linkedEntity: { entityType: 'Loan', entityId: loan._id }
                });
            }
        }

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
