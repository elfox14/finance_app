require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const checkEnv = () => {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_KEY || process.env.SECRET_KEY;
    if (!dbUri || !jwtSecret) {
        console.error('❌ CRITICAL ERROR: Environment variables missing!');
        process.exit(1);
    }
    process.env.MONGO_URI = dbUri;
    process.env.JWT_SECRET = jwtSecret;
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected`);
    } catch (error) {
        console.error(`❌ DB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/peer-debts', require('./routes/peerDebtRoutes'));

// 🚀 دعم المسار الفرعي /fin للملفات الثابتة
const clientDistPath = path.join(__dirname, '../client/dist');
app.use('/fin', express.static(clientDistPath));
app.use(express.static(clientDistPath)); // دعم المسار الرئيسي أيضاً للاحتياط

// أي طلب لا يخص الـ API يتم توجيهه لـ index.html لدعم React Router
app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) return;
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 10000;
const startServer = async () => {
    checkEnv();
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
