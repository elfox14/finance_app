const mongoose = require('mongoose');

const cardPaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    statementId: { type: mongoose.Schema.Types.ObjectId, ref: 'CardStatement' },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentType: { type: String, enum: ['كامل', 'جزئي', 'حد أدنى', 'full', 'partial', 'minimum'], default: 'كامل' },
    sourceAccount: String, // الحساب الذي تم الخصم منه (كاش، بنك...)
    notes: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CardPayment', cardPaymentSchema);
