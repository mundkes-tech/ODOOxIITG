const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    // In a real implementation, you'd fetch from a Settings model
    const settings = {
      approvalRules: [],
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        expenseSubmitted: true,
        expenseApproved: true,
        expenseRejected: true,
        weeklyReport: true,
        monthlyReport: true,
      },
      system: {
        autoApproval: false,
        requireReceipt: true,
        allowMultipleApprovers: true,
        escalationEnabled: true,
        escalationDays: 3,
        maxExpenseAmount: 50000,
        currencyConversion: true,
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update approval rules
// @route   PUT /api/settings/approval-rules
// @access  Private/Admin
exports.updateApprovalRules = async (req, res, next) => {
  try {
    const { rules } = req.body;

    // Validate rules
    if (!Array.isArray(rules)) {
      return next(new ErrorResponse('Rules must be an array', 400));
    }

    // In a real implementation, you'd save to database
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Approval rules updated successfully',
      data: rules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private/Admin
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const notificationSettings = req.body;

    // In a real implementation, you'd save to database
    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: notificationSettings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system preferences
// @route   PUT /api/settings/system
// @access  Private/Admin
exports.updateSystemPreferences = async (req, res, next) => {
  try {
    const systemPreferences = req.body;

    // In a real implementation, you'd save to database
    res.status(200).json({
      success: true,
      message: 'System preferences updated successfully',
      data: systemPreferences
    });
  } catch (error) {
    next(error);
  }
};