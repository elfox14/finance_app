const Certificate = require('../models/Certificate');

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

    return { monthlyYield, annualYield, totalExpectedReturn, maturityDate, daysLeft, monthsElapsed: Math.round(monthsElapsed) };
};

// @desc    Get all certificates with analytics
exports.getCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find({ userId: req.user._id }).sort({ createdAt: -1 });
        const enriched = certs.map(c => ({
            ...c.toObject(),
            analytics: computeAnalytics(c)
        }));
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create certificate — auto-compute endDate
exports.createCertificate = async (req, res) => {
    try {
        const { startDate, durationMonths, ...rest } = req.body;
        
        // Auto-calculate endDate
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + Number(durationMonths));
        
        const cert = await Certificate.create({ 
            ...rest, 
            startDate, 
            durationMonths: Number(durationMonths), 
            endDate, 
            userId: req.user._id 
        });
        
        res.status(201).json({ ...cert.toObject(), analytics: computeAnalytics(cert) });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update certificate
exports.updateCertificate = async (req, res) => {
    try {
        const cert = await Certificate.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!cert) return res.status(404).json({ message: 'الشهادة غير موجودة' });
        res.json({ ...cert.toObject(), analytics: computeAnalytics(cert) });
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
