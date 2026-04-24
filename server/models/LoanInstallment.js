const mongoose = require('mongoose');

const loanInstallmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    principalPart: { type: Number, default: 0 },
    interestPart: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'partial', 'late'], default: 'unpaid' },
    paidAt: { type: Date },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

loanInstallmentSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('LoanInstallment', loanInstallmentSchema);
