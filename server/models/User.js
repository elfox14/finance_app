const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'يرجى إضافة الاسم'] },
    email: { 
        type: String, 
        required: [true, 'يرجى إضافة البريد الإلكتروني'], 
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'يرجى إضافة بريد إلكتروني صحيح']
    },
    password: { 
        type: String, 
        required: [true, 'يرجى إضافة كلمة السر'], 
        minlength: 6, 
        select: false 
    }
}, { timestamps: true });

// تشفير كلمة السر قبل الحفظ
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// مقارنة كلمة السر
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
