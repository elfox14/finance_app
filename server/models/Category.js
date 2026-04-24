const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'يرجى إضافة اسم الفئة'] },
    type: { type: String, enum: ['income', 'expense'], required: true },
    isSystem: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

// لا تعرض المحذوف
categorySchema.pre('find', function() {
    this.where({ deletedAt: null });
});

categorySchema.pre('findOne', function() {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Category', categorySchema);
