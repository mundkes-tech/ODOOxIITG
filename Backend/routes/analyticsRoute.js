const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/analytics/dashboard
router.get('/dashboard', authorize('manager', 'admin'), getDashboardAnalytics);

module.exports = router;
