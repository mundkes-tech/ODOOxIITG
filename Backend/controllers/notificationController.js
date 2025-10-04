const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notifications for user
// @route   GET /api/notifications/
// @access  Authenticated
exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead } = req.query;
    
    let query = { userId: req.user.id };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/mark-read/:id
// @access  Authenticated
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }
    
    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this notification', 403));
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};
