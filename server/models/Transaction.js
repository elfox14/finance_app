const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    // Core Transaction Data
    date: { type: Date, required: true, default: Date.now },
    type: { 
        type: String, 
        required: true, 
        enum: ['دخل', 'مصروف', 'تحويل', 'سداد', 'تسوية', 'أصل', 'التزام'],
        default: 'مصروف'
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EGP' },
    
    // === NEW: Classification System ===
    // This is the primary accounting classification for reports and dashboard
    classification: {
        type: String,
        enum: [
            'operating_income',         // الدخل التشغيلي: رواتب، أرباح، تحصيلات
            'operating_expense',        // المصروف التشغيلي: سكن، أكل، مواصلات
            'financing_in',             // تمويل وارد: قروض مستلمة، سلف عليك
            'debt_principal_payment',   // سداد أصل الدين: أقساط القروض، سداد السلف
            'finance_cost',             // فوائد وعمولات: تكلفة الاقتراض
            'asset_transfer',           // تحويلات داخلية بين الحسابات
            'asset_acquisition',        // شراء أصل: شهادة، استثمار
            'asset_liquidation'         // تسييل أصل: كسر شهادة
        ]
    },
    affectsCashflow: { type: Boolean, default: true },   // هل تؤثر على التدفق النقدي التشغيلي
    affectsNetworth: { type: Boolean, default: true },   // هل تؤثر على صافي الثروة
    // === END NEW ===

    // Accounts
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true }, // Source Account
    destinationAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // For transfers
    
    // Classification
    counterparty: { type: String, trim: true }, // الطرف المقابل
    category: { type: String, default: 'عام' },
    subCategory: { type: String },
    
    // Status & Reconciliation
    status: { 
        type: String, 
        enum: ['غير مصنف', 'مصنف', 'مُرحَّل', 'مُسوّى'], 
        default: 'مُرحَّل' // Default to posted for manual entries, imported can be unclassified
    },
    confidenceScore: { type: Number, min: 0, max: 100, default: 100 }, // For AI/Auto classification
    
    // Meta
    reference: { type: String, trim: true }, // Invoice number, receipt ID, etc.
    notes: { type: String, trim: true },
    tags: [{ type: String }], // e.g. ['ضريبي', 'مستقطع']
    
    // Link to other modules (Loans, Debts, etc)
    linkedEntity: {
        entityType: { type: String, enum: ['Loan', 'Card', 'PeerDebt', 'Group', 'Certificate', 'Expense', 'Income', 'None'], default: 'None' },
        entityId: { type: mongoose.Schema.Types.ObjectId }
    }
    
}, { timestamps: true });

// Indexes for fast dashboard aggregation
transactionSchema.index({ userId: 1, date: -1, status: 1 });
transactionSchema.index({ userId: 1, type: 1, status: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, classification: 1 });
transactionSchema.index({ userId: 1, affectsCashflow: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
