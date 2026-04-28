const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    certificateName: { type: String, required: true },
    bankName: { type: String, required: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    durationMonths: { type: Number, required: true, default: 12 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    payoutFrequency: { type: String, enum: ['شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي', 'نهاية المدة'], default: 'شهري' },
    returnType: { type: String, enum: ['ثابت', 'متغير'], default: 'ثابت' },
    maturityAction: { type: String, enum: ['تجديد تلقائي', 'إضافة للحساب'], default: 'إضافة للحساب' },
    linkedAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    status: { type: String, enum: ['active', 'maturing_soon', 'matured', 'redeemed', 'renewed', 'نشطة', 'مستردة', 'منتهية'], default: 'active' },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

certificateSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Certificate', certificateSchema);
