const mongoose = require('mongoose');

const groupPaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    monthNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('GroupPayment', groupPaymentSchema);
