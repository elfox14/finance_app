const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            if (!process.env.JWT_SECRET) {
                console.error('❌ JWT_SECRET is missing!');
                return res.status(500).json({ message: 'خطأ في إعدادات السيرفر' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'المستخدم غير موجود' });
            }

            next();
        } catch (error) {
            console.error('❌ Token Verification Failed:', error.message);
            res.status(401).json({ message: 'غير مصرح لك بالدخول، التوكن غير صحيح أو انتهت صلاحيته' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'غير مصرح لك بالدخول، لم يتم العثور على توكن' });
    }
};

module.exports = { protect };
