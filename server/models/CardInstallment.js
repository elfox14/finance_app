const mongoose = require('mongoose');

const cardInstallmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CardTransaction' },
    principalAmount: { type: Number, required: true }, // المبلغ الأصلي
    installmentsCount: { type: Number, required: true }, // عدد الأقساط
    installmentAmount: { type: Number, required: true }, // قيمة القسط الشهري
    interestRate: { type: Number, default: 0 }, // نسبة الفائدة
    totalAfterInterest: { type: Number, required: true }, // الإجمالي بعد الفائدة
    paidInstallments: { type: Number, default: 0 },
    startMonth: { type: Number, required: true }, // شهر البداية
    startYear: { type: Number, required: true }, // سنة البداية
    status: { type: String, enum: ['نشط', 'مكتمل', 'ملغى', 'active', 'completed', 'cancelled'], default: 'نشط' },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CardInstallment', cardInstallmentSchema);
