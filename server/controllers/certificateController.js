const Certificate = require('../models/Certificate');

// @desc    Get all certificates
exports.getCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(certs);
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
