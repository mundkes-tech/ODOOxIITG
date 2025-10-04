const ApprovalRule = require('../models/ApprovalRule');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get approval rules
// @route   GET /api/settings/approval-rules
// @access  Admin
exports.getApprovalRules = async (req, res, next) => {
  try {
    const rules = await ApprovalRule.find({ 
      companyId: req.user.companyId,
      isActive: true 
    })
      .populate('approvers', 'name email')
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add approval rule
// @route   POST /api/settings/approval-rules
// @access  Admin
exports.addApprovalRule = async (req, res, next) => {
  try {
    const { ruleName, type, conditions, approvers, priority } = req.body;
    
    const rule = await ApprovalRule.create({
      companyId: req.user.companyId,
      ruleName,
      type,
      conditions,
      approvers,
      priority: priority || 0,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update approval rule
// @route   PUT /api/settings/approval-rules/:id
// @access  Admin
exports.updateApprovalRule = async (req, res, next) => {
  try {
    const { ruleName, type, conditions, approvers, priority, isActive } = req.body;
    
    const rule = await ApprovalRule.findByIdAndUpdate(
      req.params.id,
      { ruleName, type, conditions, approvers, priority, isActive },
      { new: true, runValidators: true }
    );
    
    if (!rule) {
      return next(new ErrorResponse('Approval rule not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete approval rule
// @route   DELETE /api/settings/approval-rules/:id
// @access  Admin
exports.deleteApprovalRule = async (req, res, next) => {
  try {
    const rule = await ApprovalRule.findByIdAndDelete(req.params.id);
    
    if (!rule) {
      return next(new ErrorResponse('Approval rule not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Approval rule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
