const dashboardService = require('../services/dashboardService');

/**
 * Dashboard Controller
 * Slim controller that delegates logic to DashboardService
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delegate logic to Service
        const stats = await dashboardService.getSummary(userId);

        // API Resource Pattern: Format response consistently
        // Note: The service already returns a formatted structure, 
        // we just ensure it's sent back as JSON.
        res.status(200).json(stats);

    } catch (err) {
        console.error('🔥 Dashboard Controller Error:', err);
        res.status(500).json({ 
            message: 'خطأ في تجميع بيانات لوحة التحكم',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
