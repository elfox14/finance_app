const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true }, // Not restricted to enum to support dynamic categories
    plannedAmount: { type: Number, required: true }, // الحد المخطط (الميزانية المعتمدة)
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    version: { type: String, enum: ['original', 'revised'], default: 'original' },
    status: { type: String, enum: ['draft', 'approved'], default: 'approved' },
    notes: { type: String, default: '' }
}, { timestamps: true });

// Prevent duplicate budget for the same category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
