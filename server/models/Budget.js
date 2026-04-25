const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { 
        type: String, 
        enum: ['طعام', 'مواصلات', 'فواتير', 'تسوق', 'صحة', 'تعليم', 'ترفيه', 'أخرى'], 
        required: true 
    },
    limit: { type: Number, required: true }, // الحد الأقصى للميزانية
    month: { type: Number, required: true }, // الشهر المستهدف
    year: { type: Number, required: true },  // السنة المستهدفة
}, { timestamps: true });

// التأكد من عدم تكرار الميزانية لنفس الفئة في نفس الشهر لنفس المستخدم
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
