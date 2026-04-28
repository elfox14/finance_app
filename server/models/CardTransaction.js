const mongoose = require('mongoose');

const cardTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    merchantName: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    category: { type: String, default: 'عام' },
    transactionType: { 
        type: String, 
        enum: ['شراء عادي', 'تقسيط', 'سحب نقدي', 'purchase', 'installment', 'cash_withdrawal'], 
        default: 'شراء عادي' 
    },
    isInstallment: { type: Boolean, default: false },
    installmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CardInstallment' },
    hasReceipt: { type: Boolean, default: false },
    receiptUrl: String,
    reconciliationStatus: { 
        type: String, 
        enum: ['pending', 'matched', 'disputed', 'missing_receipt'], 
        default: 'pending' 
    },
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CardTransaction', cardTransactionSchema);
