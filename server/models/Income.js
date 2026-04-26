const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    incomeType: { 
        type: String, 
        enum: ['ثابت', 'متغير', 'موسمي', 'استثنائي', 'fixed', 'variable', 'seasonal', 'exceptional'], 
        default: 'ثابت' 
    },
    cashFlowType: { 
        type: String, 
        enum: ['محصل', 'مستحق', 'received', 'accrued'], 
        default: 'محصل' 
    },
    isRecurring: { type: Boolean, default: false },
    recurringPeriod: { 
        type: String, 
        enum: ['شهري', 'أسبوعي', 'سنوي', 'لا يوجد', 'monthly', 'weekly', 'yearly', 'none'], 
        default: 'لا يوجد' 
    },
    account: { 
        type: String, 
        enum: ['نقدي', 'بنك', 'محفظة', 'cash', 'bank', 'wallet'], 
        default: 'نقدي' 
    },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
