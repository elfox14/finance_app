const mongoose = require('mongoose');

const loanInstallmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    principalPart: { type: Number }, // جزء الأصل
    interestPart: { type: Number }, // جزء الفائدة
    status: { type: String, enum: ['غير مدفوع', 'مدفوع', 'متأخر', 'unpaid', 'paid', 'late'], default: 'unpaid' },
    paymentDate: { type: Date },
    remainingBalanceAfter: { type: Number }, // المتبقي بعد هذا القسط
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('LoanInstallment', loanInstallmentSchema);
