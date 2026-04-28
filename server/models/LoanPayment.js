const mongoose = require('mongoose');

const loanPaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    installmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanInstallment' },
    amount: { type: Number, required: true },
    principalPaid: { type: Number, default: 0 },
    interestPaid: { type: Number, default: 0 },
    feesPaid: { type: Number, default: 0 },
    paymentDate: { type: Date, default: Date.now },
    paymentType: { type: String, enum: ['قسط دوري', 'سداد مبكر', 'دفعة إضافية', 'installment', 'early_settlement', 'extra'], default: 'قسط دوري' },
    sourceAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // الحساب الذي تم الخصم منه
    note: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('LoanPayment', loanPaymentSchema);
