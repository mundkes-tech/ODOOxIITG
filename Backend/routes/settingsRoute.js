const express = require('express');
const router = express.Router();
const { 
  getSettings,
  updateApprovalRules,
  updateNotificationSettings,
  updateSystemPreferences
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// All routes below this middleware will be protected and require authentication
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// Get all settings
router.get('/', getSettings);

// Update approval rules
router.put('/approval-rules', updateApprovalRules);

// Update notification settings
router.put('/notifications', updateNotificationSettings);

// Update system preferences
router.put('/system', updateSystemPreferences);

module.exports = router;