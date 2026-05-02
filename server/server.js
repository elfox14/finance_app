require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const kpiService = require('./services/kpiService');

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
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/dashboard', require('./routes/dashboardRoutes'));
apiRouter.use('/expenses', require('./routes/expenseRoutes'));
apiRouter.use('/incomes', require('./routes/incomeRoutes'));
apiRouter.use('/cards', require('./routes/cardRoutes'));
apiRouter.use('/loans', require('./routes/loanRoutes'));
apiRouter.use('/groups', require('./routes/groupRoutes'));
apiRouter.use('/certificates', require('./routes/certificateRoutes'));
apiRouter.use('/budgets', require('./routes/budgetRoutes'));
apiRouter.use('/notifications', require('./routes/notificationRoutes'));
apiRouter.use('/peer-debts', require('./routes/peerDebtRoutes'));
apiRouter.use('/reports-data', require('./routes/reportRoutes'));
apiRouter.use('/accounts', require('./routes/accountRoutes'));
apiRouter.use('/transactions', require('./routes/transactionRoutes'));

app.use('/api', apiRouter);
app.use('/fin/api', apiRouter);

// 🚀 دعم المسار الفرعي /fin للملفات الثابتة
const clientDistPath = path.join(__dirname, '../client/dist');
app.use('/fin', express.static(clientDistPath));
app.use(express.static(clientDistPath)); // دعم المسار الرئيسي أيضاً للاحتياط

// أي طلب لا يخص الـ API يتم توجيهه لـ index.html لدعم React Router
app.use((req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/fin/api')) {
        return next();
    }
    return res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 10000;
const startServer = async () => {
    checkEnv();
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        
        // Start Cron Jobs
        cron.schedule('0 1 * * *', () => {
            console.log('⏳ Running scheduled KPI Snapshots...');
            kpiService.generateDailySnapshotsForAll();
        });
    });
};

startServer();
