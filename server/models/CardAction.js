const mongoose = require('mongoose');

const cardActionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    type: { 
        type: String, 
        enum: ['purchase', 'payment', 'fee', 'reversal'], 
        required: true 
    },
    amount: { type: Number, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CardAction', cardActionSchema);
