const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/notifications/
router.get('/', getNotifications);

// @route   PUT /api/notifications/mark-read/:id
router.put('/mark-read/:id', markNotificationAsRead);

module.exports = router;
