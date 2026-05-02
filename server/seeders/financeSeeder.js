const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Lending = require('../models/Lending');
const Borrowing = require('../models/Borrowing');
const Certificate = require('../models/Certificate');

const seedData = async () => {
    try {
        console.log('--- Starting Finance Seeder ---');
        
        // 1. Get or Create Main User
        let user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            user = await User.create({
                name: 'مستخدم تجريبي',
                email: 'test@example.com',
                password: 'password123' // In real app, this would be hashed
            });
            console.log('User created.');
        }

        // 2. Clear existing data for this user to avoid duplicates
        await Promise.all([
            Account.deleteMany({ userId: user._id }),
            Category.deleteMany({ userId: user._id }),
            Transaction.deleteMany({ userId: user._id }),
            Loan.deleteMany({ userId: user._id }),
            Lending.deleteMany({ userId: user._id }),
            Borrowing.deleteMany({ userId: user._id }),
            Certificate.deleteMany({ userId: user._id })
        ]);

        // 3. Create Categories
        const categories = await Category.insertMany([
            { userId: user._id, name: 'راتب', type: 'income', icon: 'Coins' },
            { userId: user._id, name: 'عمل حر', type: 'income', icon: 'Briefcase' },
            { userId: user._id, name: 'طعام', type: 'expense', icon: 'ShoppingBag' },
            { userId: user._id, name: 'إيجار', type: 'expense', icon: 'Home' },
            { userId: user._id, name: 'فوائد وعمولات', type: 'expense', icon: 'Percent' },
            { userId: user._id, name: 'أصول', type: 'asset', icon: 'Landmark' }
        ]);
        console.log('Categories seeded.');

        // 4. Create Accounts
        const bank = await Account.create({
            userId: user._id,
            name: 'حساب بنكي',
            type: 'bank',
            balance: 15000,
            currency: 'EGP',
            isLiquid: true
        });

        const cash = await Account.create({
            userId: user._id,
            name: 'الصندوق (كاش)',
            type: 'cash',
            balance: 5000,
            currency: 'EGP',
            isLiquid: true
        });
        console.log('Accounts seeded.');

        // 5. Create Demo Transactions
        await Transaction.insertMany([
            {
                userId: user._id,
                date: new Date(),
                amount: 12000,
                type: 'income',
                classification: 'operating_income',
                categoryId: categories.find(c => c.name === 'راتب')._id,
                accountId: bank._id,
                description: 'راتب شهر مايو',
                isPosted: true
            },
            {
                userId: user._id,
                date: new Date(),
                amount: 2500,
                type: 'expense',
                classification: 'operating_expense',
                categoryId: categories.find(c => c.name === 'إيجار')._id,
                accountId: bank._id,
                description: 'إيجار الشقة',
                isPosted: true
            }
        ]);

        // 6. Create Loan & Financing
        const loan = await Loan.create({
            userId: user._id,
            lenderName: 'بنك مصر',
            principalAmount: 50000,
            receivedAmount: 50000,
            remainingBalance: 47000,
            interestRate: 18.5,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            status: 'active'
        });

        // Financing Transaction (Receiving the loan) - Does not affect Net Worth
        await Transaction.create({
            userId: user._id,
            date: loan.startDate,
            amount: 50000,
            type: 'income',
            classification: 'financing_in',
            accountId: bank._id,
            linkedEntity: loan._id,
            entityType: 'Loan',
            description: 'استلام أصل القرض',
            isPosted: true
        });

        console.log('Finance data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

// Execute if called directly
if (require.main === module) {
    // Connect to DB first (Assuming standard URI)
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_app')
        .then(() => seedData());
}

module.exports = seedData;
