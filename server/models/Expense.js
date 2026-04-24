const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    paymentMethod: { type: String, default: 'كاش' },
    date: { type: Date, default: Date.now },
    note: String,
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

expenseSchema.pre(/^find/, function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Expense', expenseSchema);
