const Group = require('../models/Group');

// @desc    Get all groups
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create group
exports.createGroup = async (req, res) => {
    try {
        const group = await Group.create({ ...req.body, userId: req.user._id });
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete group
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { deletedAt: new Date() },
            { new: true }
        );
        res.json({ message: 'تم حذف الجمعية بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
