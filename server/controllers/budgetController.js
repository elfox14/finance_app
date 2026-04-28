const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for a specific month with actuals
exports.getBudgets = async (req, res) => {
    try {
        const { month, year } = req.query;
        const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
        const targetYear = year ? Number(year) : new Date().getFullYear();

        const budgets = await Budget.find({ userId: req.user._id, month: targetMonth, year: targetYear });
        
        // Fetch actual expenses from unified ledger for this month
        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        
        const actualTransactions = await Transaction.find({ 
            userId: req.user._id, 
            type: 'مصروف',
            status: { $in: ['مُرحَّل', 'مُسوّى'] }, // Only count posted/reconciled expenses
            date: { $gte: startOfMonth, $lte: endOfMonth },
            deletedAt: null 
        });

        // Compute Variance and Percentages
        const budgetsWithProgress = budgets.map(b => {
            const spent = actualTransactions
                .filter(tx => tx.category === b.category)
                .reduce((sum, tx) => sum + tx.amount, 0);
            
            const plannedAmount = b.plannedAmount || b.limit || 0; // fallback if migrating old records
            const variance = plannedAmount - spent;
            const variancePercent = plannedAmount > 0 ? (spent / plannedAmount) * 100 : (spent > 0 ? 100 : 0);

            let status = 'green';
            if (variancePercent > 100) status = 'red';
            else if (variancePercent >= 80) status = 'yellow';

            return {
                ...b.toObject(),
                spent,
                variance,
                variancePercent: variancePercent.toFixed(1),
                trafficLight: status
            };
        });

        // Aggregate KPIs
        const totalBudget = budgetsWithProgress.reduce((s, b) => s + (b.plannedAmount || b.limit || 0), 0);
        const totalActual = budgetsWithProgress.reduce((s, b) => s + b.spent, 0);
        const totalRemaining = totalBudget - totalActual;
        const exceededCount = budgetsWithProgress.filter(b => b.trafficLight === 'red').length;

        // Total Actual including unbudgeted categories
        const overallSpent = actualTransactions.reduce((s, tx) => s + tx.amount, 0);
        const unbudgetedSpent = overallSpent - totalActual;

        res.json({
            budgets: budgetsWithProgress,
            kpis: {
                totalBudget,
                totalActual,
                totalRemaining,
                exceededCount,
                overallSpent,
                unbudgetedSpent
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set or Update budget
exports.setBudget = async (req, res) => {
    const { category, plannedAmount, month, year, status, notes } = req.body;
    
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    try {
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user._id, category, month: targetMonth, year: targetYear },
            { 
                plannedAmount: Number(plannedAmount),
                status: status || 'approved',
                notes,
                version: 'revised' // Mark as revised since it's an update after potential original creation
            },
            { upsert: true, new: true, runValidators: true }
        );
        res.json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Duplicate previous month budgets
exports.duplicateBudgets = async (req, res) => {
    try {
        const { targetMonth, targetYear } = req.body; // Month to copy TO
        
        let prevMonth = targetMonth - 1;
        let prevYear = targetYear;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }

        const oldBudgets = await Budget.find({ userId: req.user._id, month: prevMonth, year: prevYear });
        
        if (oldBudgets.length === 0) {
            return res.status(404).json({ message: 'لا توجد موازنات في الشهر السابق لنسخها' });
        }

        let copied = 0;
        for (const ob of oldBudgets) {
            const exists = await Budget.findOne({ userId: req.user._id, category: ob.category, month: targetMonth, year: targetYear });
            if (!exists) {
                await Budget.create({
                    userId: req.user._id,
                    category: ob.category,
                    plannedAmount: ob.plannedAmount || ob.limit, // Fallback for old schema
                    month: targetMonth,
                    year: targetYear,
                    version: 'original',
                    status: 'draft' // Copied as draft by default
                });
                copied++;
            }
        }

        res.json({ message: `تم نسخ ${copied} موازنة للشهر الحالي كمسودة بنجاح` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete Budget
exports.deleteBudget = async (req, res) => {
    try {
        await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'تم الحذف' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
