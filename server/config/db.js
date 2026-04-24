const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // البحث عن الرابط في أكثر من مسمى شائع لضمان العمل في كل المنصات
        const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!dbURI) {
            throw new Error('❌ خطأ: لم يتم العثور على رابط MongoDB_URI في إعدادات البيئة (Environment Variables).');
        }

        const conn = await mongoose.connect(dbURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Error: ${error.message}`);
        // لا تخرج من العملية مباشرة للسماح للخادم بالبقاء يعمل (اختياري)
        // process.exit(1); 
    }
};

module.exports = connectDB;
