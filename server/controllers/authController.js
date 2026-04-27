const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET.trim(), { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
        }

        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            console.log(`❌ Login failed for email: ${email}`);
            res.status(401).json({ message: 'البريد أو كلمة السر غير صحيحة' });
        }
    } catch (error) {
        console.error('🔥 Login Error Details:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);
};

// تحديث اسم المستخدم
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'الاسم يجب أن يكون حرفين على الأقل' });
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true }
        );
        res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        
        if (!await user.matchPassword(currentPassword)) {
            return res.status(401).json({ message: 'كلمة المرور الحالية غير صحيحة' });
        }
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

