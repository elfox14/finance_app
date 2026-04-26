const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    expenseType: { 
        type: String, 
        enum: ['ثابت', 'متغير', 'طارئ', 'موسمي', 'fixed', 'variable', 'urgent', 'seasonal'], 
        default: 'متغير' 
    },
    necessityLevel: { 
        type: String, 
        enum: ['أساسي', 'مهم', 'كمالي', 'basic', 'important', 'luxury'], 
        default: 'أساسي' 
    },
    budgetCategory: { 
        type: String, 
        enum: ['طعام', 'مواصلات', 'فواتير', 'تسوق', 'صحة', 'تعليم', 'ترفيه', 'أخرى', 'عام', 'طعام', 'مواصلات', 'سكن'], 
        default: 'أخرى' 
    },
    category: String, // Compatibility with frontend
    paymentSource: { 
        type: String, 
        enum: ['كاش', 'بنك', 'بطاقة', 'محفظة', 'cash', 'bank', 'card', 'wallet'], 
        default: 'كاش' 
    },
    account: String, // Compatibility with frontend
    isRecurring: { type: Boolean, default: false },
    vendor: String, // التاجر أو المكان
    date: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
