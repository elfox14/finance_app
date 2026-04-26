const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupName: { type: String, required: true },
    totalAmount: { type: Number, required: true }, // المبلغ الكلي الذي سيقبضه
    monthlyAmount: { type: Number, required: true }, // القسط الشهري
    durationMonths: { type: Number, required: true }, // عدد الشهور
    userPayoutOrder: { type: Number, required: true }, // ترتيب القبض (مثلاً: 5)
    startDate: { type: Date, default: Date.now }, // تاريخ بداية الجمعية
    isPaidOut: { type: Boolean, default: false }, // هل قبض المبلغ أم لا
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
