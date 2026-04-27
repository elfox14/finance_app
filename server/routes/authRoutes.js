const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { deleteAllData } = require('../controllers/dataController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/nuke', protect, deleteAllData);

// 🚨 مسار طوارئ مطور لإعادة تعيين كلمة السر
router.post('/rescue-reset', async (req, res) => {
    let { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'يرجى تقديم البريد وكلمة السر' });
    }

    try {
        // تحويل البريد لحروف صغيرة وتنظيف المسافات لضمان المطابقة
        const normalizedEmail = email.trim().toLowerCase();
        
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            console.log(`❌ Rescue failed: User with email [${normalizedEmail}] not found.`);
            return res.status(404).json({ message: 'عذراً، هذا البريد غير مسجل في النظام' });
        }

        user.password = newPassword;
        await user.save();
        
        console.log(`✅ Success: Password reset for [${normalizedEmail}]`);
        res.json({ message: '✅ تم تحديث كلمة السر بنجاح. يمكنك الدخول الآن.' });
    } catch (err) {
        console.error('🔥 Rescue Error:', err);
        res.status(500).json({ message: 'خطأ داخلي في السيرفر، يرجى المحاولة لاحقاً' });
    }
});

module.exports = router;
