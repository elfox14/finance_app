const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // الحساب أو المحفظة
    
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EGP' },
    date: { type: Date, required: true, default: Date.now },
    
    category: { type: String, required: true, default: 'عام' }, // الفئة الرئيسية
    subCategory: { type: String }, // الفئة الفرعية
    
    description: { type: String, default: '' }, // وصف العملية
    vendor: { type: String }, // اسم المتجر / الجهة
    
    paymentMethod: { 
        type: String, 
        enum: ['كاش', 'بنك', 'بطاقة', 'محفظة', 'تحويل', 'أخرى'], 
        default: 'كاش' 
    },
    
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { 
        type: String, 
        enum: ['يومي', 'أسبوعي', 'شهري', 'سنوي', 'بدون'], 
        default: 'بدون' 
    },
    
    status: { 
        type: String, 
        enum: ['new', 'categorized', 'reconciled', 'flagged'], 
        default: 'new' 
    },
    
    hasReceipt: { type: Boolean, default: false },
    receiptUrl: { type: String }, // في حال رفع ملف
    
    note: { type: String, default: '' },
    
    // For legacy support / compatibility with old charts until fully migrated
    expenseType: { type: String, enum: ['ثابت', 'متغير', 'طارئ', 'موسمي'], default: 'متغير' },
    necessityLevel: { type: String, enum: ['أساسي', 'مهم', 'كمالي'], default: 'أساسي' }

}, { timestamps: true });

// Indexes for fast retrieval
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
