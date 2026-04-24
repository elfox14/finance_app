const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanName: { type: String, required: true },
    lenderName: { type: String, required: true },
    loanType: { type: String, enum: ['شخصي', 'سيارة', 'عقاري', 'أخرى'], default: 'شخصي' },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, default: 0 },
    interestType: { type: String, enum: ['ثابتة', 'متناقصة'], default: 'ثابتة' },
    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    firstDueDate: { type: Date, required: true },
    monthlyInstallment: { type: Number, required: true },
    dueDay: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    totalPayable: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    status: { type: String, enum: ['نشط', 'منتهٍ', 'متعثر'], default: 'نشط' },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

loanSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Loan', loanSchema);
