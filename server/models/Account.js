const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // اسم الحساب
    type: { 
        type: String, 
        enum: ['نقدي', 'بنكي', 'محفظة_إلكترونية', 'توفير', 'استثمار'],
        required: true 
    },
    bankName: { type: String, default: '' }, // اسم البنك إن وجد
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'EGP' },
    accountNumber: { type: String, default: '' }, // آخر 4 أرقام
    color: { type: String, default: '#3b82f6' }, // لون الكارد
    icon: { type: String, default: 'wallet' },
    isDefault: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
