const mongoose = require('mongoose');

const cardStatementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    statementMonth: { type: Number, required: true },
    statementYear: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    purchasesTotal: { type: Number, default: 0 },
    installmentsDue: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    interestAmount: { type: Number, default: 0 },
    minimumPayment: { type: Number, default: 0 },
    statementAmount: { type: Number, required: true }, // المبلغ الإجمالي المطلوب
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['غير مدفوع', 'مدفوع جزئياً', 'مدفوع بالكامل', 'تجاوز الاستحقاق', 'unpaid', 'partially_paid', 'paid', 'overdue'], default: 'unpaid' },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CardStatement', cardStatementSchema);
