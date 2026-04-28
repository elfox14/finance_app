const mongoose = require('mongoose');

const kpiSnapshotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    // KPI 1-2
    netIncomeMTD: { type: Number, default: 0 },
    netMarginMTD: { type: Number, default: 0 }, // %
    // KPI 3-4
    incomeMTD: { type: Number, default: 0 },
    incomeGrowthMoM: { type: Number, default: 0 }, // %
    // KPI 5-6
    cashOnHand: { type: Number, default: 0 },
    operatingCashFlowMTD: { type: Number, default: 0 },
    // KPI 7
    workingCapital: { type: Number, default: 0 }, // Available Balance
    // KPI 8-10 (Personal/Small Business Focus)
    savingsRate: { type: Number, default: 0 }, // %
    fixedExpensesRatio: { type: Number, default: 0 }, // %
    debtToIncomeRatio: { type: Number, default: 0 }, // %
    
    // Additional required data for dashboard charting (Target comparisons, etc)
    expensesMTD: { type: Number, default: 0 },
    budgetTargetMTD: { type: Number, default: 0 }, // Expected total budget target for the month
    
    // Details
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Ensure we only have one snapshot per day per user
kpiSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('KPISnapshot', kpiSnapshotSchema);
