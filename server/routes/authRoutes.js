const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); // استيراد الموديل مباشرة لحالة الطوارئ

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// 🚨 مسار طوارئ مؤقت لإعادة تعيين كلمة السر (قم بحذفه بعد الاستخدام)
router.post('/rescue-reset', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: '✅ تم تحديث كلمة السر بنجاح. يمكنك الدخول الآن.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
