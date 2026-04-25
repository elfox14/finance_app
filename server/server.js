require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const checkEnv = () => {
    // دعم كلا الاسمين الشائعين لرابط قاعدة البيانات
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_KEY || process.env.SECRET_KEY;

    if (!dbUri) {
        console.error('❌ CRITICAL ERROR: Database URI is missing! (Tried MONGO_URI and MONGODB_URI)');
        process.exit(1);
    }

    if (!jwtSecret) {
        console.error('❌ CRITICAL ERROR: JWT Secret is missing! (Tried JWT_SECRET, JWT_KEY, SECRET_KEY)');
        process.exit(1);
    }

    // تعيين القيم المختارة للمتغيرات التي يعتمد عليها الكود
    process.env.MONGO_URI = dbUri;
    process.env.JWT_SECRET = jwtSecret;

    console.log('✅ Environment check passed!');
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
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
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
