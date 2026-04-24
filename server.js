const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mohafazati')
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas & Models ---

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    type: String, // income, expense
    amount: Number,
    desc: String,
    cat: String,
    date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Pro Card Schema
const cardSchema = new mongoose.Schema({
    name: String,
    bank: String,
    last4: String,
    type: String,
    limit: Number,
    used: { type: Number, default: 0 },
    statementDay: Number,
    dueDay: Number,
    interestRate: Number,
    minPayPercent: Number,
    lateFee: Number,
    status: { type: String, default: 'active' },
    statements: [{
        month: Number,
        year: Number,
        totalPurchases: Number,
        amountDue: Number,
        paidAmount: { type: Number, default: 0 },
        status: String,
        dueDate: String
    }]
});
const Card = mongoose.model('Card', cardSchema);

// Loan Schema
const loanSchema = new mongoose.Schema({
    name: String,
    principal: Number,
    totalPayback: Number,
    remaining: Number,
    status: { type: String, default: 'active' },
    installments: [{
        dueDate: String,
        amount: Number,
        status: String,
        paidAmount: Number
    }]
});
const Loan = mongoose.model('Loan', loanSchema);

// --- API Routes ---

// Get All Data (Dashboard Sync)
app.get('/api/sync', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 }).limit(50);
        const loans = await Loan.find();
        const cards = await Card.find();
        res.json({ transactions, loans, cards });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Transactions
app.post('/api/transactions', async (req, res) => {
    const txn = new Transaction(req.body);
    await txn.save();
    res.json(txn);
});

// Cards
app.post('/api/cards', async (req, res) => {
    const card = new Card(req.body);
    await card.save();
    res.json(card);
});

app.get('/api/cards', async (req, res) => {
    const cards = await Card.find();
    res.json(cards);
});

// Loans
app.post('/api/loans', async (req, res) => {
    const loan = new Loan(req.body);
    await loan.save();
    res.json(loan);
});

app.get('/api/loans', async (req, res) => {
    const loans = await Loan.find();
    res.json(loans);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
