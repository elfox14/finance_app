const Certificate = require('../models/Certificate');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Helper: compute certificate analytics
const computeAnalytics = (cert) => {
    const principal  = cert.principalAmount  || 0;
    const rate       = cert.interestRate      || 0; // annual %
    const duration   = cert.durationMonths    || 0;
    const startDate  = new Date(cert.startDate);

    const annualYield   = (principal * rate) / 100;
    const monthlyYield  = annualYield / 12;
    const totalExpectedReturn = monthlyYield * duration;

    const maturityDate  = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + duration);

    const now = new Date();
    const daysLeft   = Math.max(0, Math.ceil((maturityDate - now) / (1000 * 60 * 60 * 24)));
    const monthsElapsed = Math.max(0, (now - startDate) / (1000 * 60 * 60 * 24 * 30));
    
    // Calculate Earned Yield (Cap at total expected if matured)
    const earnedYield = Math.min(totalExpectedReturn, (monthsElapsed * monthlyYield));

    // Dynamic Status Calculation if not already redeemed/renewed
    let currentStatus = cert.status;
    if (!['redeemed', 'renewed', 'مستردة'].includes(currentStatus)) {
        if (daysLeft === 0) currentStatus = 'matured';
        else if (daysLeft <= 30) currentStatus = 'maturing_soon';
        else currentStatus = 'active';
    }

    return { 
        monthlyYield, 
        annualYield, 
        totalExpectedReturn, 
        maturityDate, 
        daysLeft, 
        monthsElapsed: Math.round(monthsElapsed),
        earnedYield,
        currentStatus
    };
};

// @desc    Get all certificates with analytics
exports.getCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find({ userId: req.user._id, deletedAt: null })
            .populate('linkedAccountId', 'name')
            .sort({ startDate: -1 });

        let totalPrincipal = 0;
        let totalExpectedReturn = 0;
        let totalEarnedYield = 0;
        let maturingWithin30Days = 0;

        const enriched = certs.map(c => {
            const analytics = computeAnalytics(c);
            
            if (['active', 'maturing_soon', 'matured', 'نشطة'].includes(analytics.currentStatus)) {
                totalPrincipal += c.principalAmount;
                totalExpectedReturn += analytics.totalExpectedReturn;
                totalEarnedYield += analytics.earnedYield;
                if (analytics.daysLeft <= 30) maturingWithin30Days++;
            }

            return {
                ...c.toObject(),
                analytics,
                status: analytics.currentStatus // Overwrite frontend status display
            };
        });

        res.json({
            certificates: enriched,
            stats: {
                totalPrincipal,
                totalExpectedReturn,
                totalEarnedYield,
                maturingWithin30Days
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create certificate — auto-compute endDate & Record Transaction
exports.createCertificate = async (req, res) => {
    try {
        const { startDate, durationMonths, linkedAccountId, principalAmount, ...rest } = req.body;
        const userId = req.user._id;

        // Auto-calculate endDate
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + Number(durationMonths));
        
        const cert = await Certificate.create({ 
            ...rest, 
            principalAmount: Number(principalAmount),
            startDate, 
            durationMonths: Number(durationMonths), 
            endDate, 
            linkedAccountId,
            userId 
        });

        // Accounting: Reduce Liquid Account and record Asset creation
        if (linkedAccountId) {
            const account = await Account.findById(linkedAccountId);
            if (account) {
                account.balance -= Number(principalAmount);
                await account.save();

                await Transaction.create({
                    userId,
                    accountId: linkedAccountId,
                    amount: Number(principalAmount),
                    date: startDate || new Date(),
                    type: 'تحويل', // Transfer to asset
                    category: 'استثمار',
                    counterparty: rest.bankName,
                    notes: `ربط شهادة استثمارية: ${rest.certificateName}`,
                    status: 'مُسوّى',
                    linkedEntity: { entityType: 'Certificate', entityId: cert._id }
                });
            }
        }
        
        res.status(201).json({ ...cert.toObject(), analytics: computeAnalytics(cert) });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Redeem/Update certificate
exports.updateCertificate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { status } = req.body; // e.g. redeeming

        const cert = await Certificate.findOne({ _id: id, userId });
        if (!cert) return res.status(404).json({ message: 'الشهادة غير موجودة' });

        if (status === 'redeemed' && cert.status !== 'redeemed') {
            // Money goes back to account
            if (cert.linkedAccountId) {
                const account = await Account.findById(cert.linkedAccountId);
                if (account) {
                    account.balance += cert.principalAmount;
                    await account.save();

                    await Transaction.create({
                        userId,
                        accountId: cert.linkedAccountId,
                        amount: cert.principalAmount,
                        date: new Date(),
                        type: 'تحويل',
                        category: 'استرداد استثمار',
                        counterparty: cert.bankName,
                        notes: `استرداد شهادة: ${cert.certificateName}`,
                        status: 'مُسوّى',
                        linkedEntity: { entityType: 'Certificate', entityId: cert._id }
                    });
                }
            }
        }

        const updated = await Certificate.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ ...updated.toObject(), analytics: computeAnalytics(updated) });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete certificate
exports.deleteCertificate = async (req, res) => {
    try {
        const cert = await Certificate.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() }
        );
        if (!cert) return res.status(404).json({ message: 'الشهادة غير موجودة' });
        res.json({ message: 'تم حذف الشهادة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
