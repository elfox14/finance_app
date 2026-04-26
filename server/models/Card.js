const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardName: { type: String, required: true },
    bankName: { type: String, required: true },
    lastFourDigits: { type: String, maxLength: 4 },
    cardType: { type: String, enum: ['مشتريات', 'ائتمان', 'تقسيط'], default: 'مشتريات' },
    creditLimit: { type: Number, required: true },
    currentBalance: { type: Number, default: 0 }, // المبلغ المستخدم حالياً
    statementDay: { type: Number, required: true, min: 1, max: 31 },
    dueDay: { type: Number, required: true, min: 1, max: 31 },
    interestRate: { type: Number, default: 0 },
    minimumPaymentPercent: { type: Number, default: 5 },
    lateFee: { type: Number, default: 0 },
    status: { type: String, enum: ['نشطة', 'موقوفة', 'ملغاة'], default: 'نشطة' },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

cardSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Card', cardSchema);
