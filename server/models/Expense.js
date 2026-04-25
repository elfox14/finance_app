const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    note: { type: String, required: true },
    expenseType: { 
        type: String, 
        enum: ['ثابت', 'متغير', 'طارئ', 'موسمي'], 
        default: 'متغير' 
    },
    necessityLevel: { 
        type: String, 
        enum: ['أساسي', 'مهم', 'كمالي'], 
        default: 'أساسي' 
    },
    budgetCategory: { 
        type: String, 
        enum: ['طعام', 'مواصلات', 'فواتير', 'تسوق', 'صحة', 'تعليم', 'ترفيه', 'أخرى'], 
        default: 'أخرى' 
    },
    paymentSource: { 
        type: String, 
        enum: ['كاش', 'بنك', 'بطاقة', 'محفظة'], 
        default: 'كاش' 
    },
    isRecurring: { type: Boolean, default: false },
    vendor: String, // التاجر أو المكان
    date: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
