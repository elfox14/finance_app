const mongoose = require('mongoose');

// موديل الدفعات الجزئية للسلف
const peerDebtPaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    debtId: { type: mongoose.Schema.Types.ObjectId, ref: 'PeerDebt', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

const peerDebtSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personName: { type: String, required: true },
    amount: { type: Number, required: true }, // أصل الدين (Opening Amount)
    type: { type: String, enum: ['borrowed', 'lent'], required: true },
    dueDate: Date,
    isPaid: { type: Boolean, default: false }, // هل أغلقت تماماً
    note: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const PeerDebt = mongoose.model('PeerDebt', peerDebtSchema);
const PeerDebtPayment = mongoose.model('PeerDebtPayment', peerDebtPaymentSchema);

module.exports = { PeerDebt, PeerDebtPayment };
