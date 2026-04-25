const mongoose = require('mongoose');

const peerDebtSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['borrowed', 'lent'], required: true }, // borrowed = سلف ، lent = تسليف
    dueDate: { type: Date },
    status: { type: String, enum: ['نشط', 'مسدد'], default: 'نشط' },
    note: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

peerDebtSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('PeerDebt', peerDebtSchema);
