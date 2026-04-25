const mongoose = require('mongoose');

const loanPaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    installmentNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    principalComponent: { type: Number, required: true }, // جزء أصل الدين
    interestComponent: { type: Number, required: true },  // جزء الفائدة
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['paid', 'pending', 'late'], default: 'paid' },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('LoanPayment', loanPaymentSchema);
