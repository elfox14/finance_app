const Certificate = require('../models/Certificate');

// @desc    Get all certificates
exports.getCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find({ userId: req.user._id }).sort({ createdAt: -1 });
        
        const certsWithAnalytics = certs.map(cert => {
            let monthlyYield = 0;
            if (cert.payoutFrequency === 'شهري' || cert.payoutFrequency === 'monthly') {
                monthlyYield = (cert.principalAmount * (cert.interestRate / 100)) / 12;
            } else if (cert.payoutFrequency === 'ربع سنوي' || cert.payoutFrequency === 'quarterly') {
                monthlyYield = (cert.principalAmount * (cert.interestRate / 100)) / 4;
            } else if (cert.payoutFrequency === 'سنوي' || cert.payoutFrequency === 'yearly') {
                monthlyYield = (cert.principalAmount * (cert.interestRate / 100));
            }
            
            const maturityDate = new Date(cert.startDate);
            maturityDate.setMonth(maturityDate.getMonth() + cert.durationMonths);

            return {
                ...cert._doc,
                analytics: {
                    monthlyYield,
                    maturityDate,
                    totalYield: (cert.principalAmount * (cert.interestRate / 100)) * (cert.durationMonths / 12)
                }
            };
        });

        res.json(certsWithAnalytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create certificate
exports.createCertificate = async (req, res) => {
    try {
        const cert = await Certificate.create({ ...req.body, userId: req.user._id });
        res.status(201).json(cert);
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
        res.json(cert);
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
