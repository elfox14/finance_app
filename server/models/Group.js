const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupName: { type: String, required: true },
    membersCount: { type: Number, required: true },
    monthlyAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    durationMonths: { type: Number, required: true },
    userRole: { type: String, enum: ['مدير', 'عضو'], default: 'عضو' },
    userPayoutOrder: { type: Number, required: true },
    status: { type: String, enum: ['نشطة', 'منتهية', 'ملغاة'], default: 'نشطة' },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

groupSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Group', groupSchema);
