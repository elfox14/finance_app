const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    date: { type: Date, default: Date.now },
    note: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

incomeSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Income', incomeSchema);
