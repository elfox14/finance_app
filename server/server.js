require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// فحص وجود المتغيرات مع طباعة المفاتيح المتاحة للتشخيص
const checkEnv = () => {
    console.log('🔍 Available Environment Keys:', Object.keys(process.env).filter(k => !k.includes('TOKEN') && !k.includes('SECRET') && !k.includes('KEY')));
    
    const required = ['MONGO_URI', 'JWT_SECRET'];
    let missing = false;

    required.forEach(variable => {
        if (!process.env[variable]) {
            console.error(`❌ CRITICAL ERROR: Variable "${variable}" is missing!`);
            missing = true;
        }
    });

    if (missing) {
        // محاولة فحص أسماء بديلة شائعة
        if (process.env.MONGODB_URI) console.log('💡 Found "MONGODB_URI", maybe you meant to name it "MONGO_URI"?');
        process.exit(1);
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/peer-debts', require('./routes/peerDebtRoutes'));

app.get('/', (req, res) => res.send('جيبي API يعمل بنجاح 🚀'));

const PORT = process.env.PORT || 10000;

const startServer = async () => {
    checkEnv();
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();
