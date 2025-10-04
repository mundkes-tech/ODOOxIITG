const Workflow = require('../models/Workflow');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create approval workflow
// @route   POST /api/workflow/
// @access  Admin
exports.createWorkflow = async (req, res, next) => {
  try {
    const { expenseId, approvers, rules } = req.body;
    
    // Check if expense exists
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    // Check if workflow already exists for this expense
    const existingWorkflow = await Workflow.findOne({ expenseId });
    if (existingWorkflow) {
      return next(new ErrorResponse('Workflow already exists for this expense', 400));
    }
    
    // Create workflow steps
    const steps = approvers.map(approverId => ({
      approverId,
      status: 'pending'
    }));
    
    const workflow = await Workflow.create({
      expenseId,
      companyId: req.user.companyId,
      submittedBy: expense.submittedBy,
      steps,
      rules
    });
    
    // Update expense with workflow ID
    await Expense.findByIdAndUpdate(expenseId, { workflowId: workflow._id });
    
    // Create notification for first approver
    if (steps.length > 0) {
      await Notification.create({
        userId: steps[0].approverId,
        companyId: req.user.companyId,
        type: 'approval_required',
        title: 'Approval Required',
        message: `You have a new expense to approve`,
        data: { expenseId, workflowId: workflow._id }
      });
    }
    
    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workflow status & progress
// @route   GET /api/workflow/:expenseId
// @access  Employee / Manager / Admin
exports.getWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ expenseId: req.params.expenseId })
      .populate('steps.approverId', 'name email')
      .populate('submittedBy', 'name email');
    
    if (!workflow) {
      return next(new ErrorResponse('Workflow not found', 404));
    }
    
    // Check if user has access to this workflow
    if (req.user.role === 'employee' && workflow.submittedBy._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this workflow', 403));
    }
    
    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve workflow step
// @route   PUT /api/workflow/:expenseId/approve
// @access  Approver
exports.approveWorkflowStep = async (req, res, next) => {
  try {
    const { approverId, comment } = req.body;
    
    const workflow = await Workflow.findOne({ expenseId: req.params.expenseId });
    
    if (!workflow) {
      return next(new ErrorResponse('Workflow not found', 404));
    }
    
    // Find the current step for this approver
    const currentStepIndex = workflow.steps.findIndex(
      step => step.approverId.toString() === approverId && step.status === 'pending'
    );
    
    if (currentStepIndex === -1) {
      return next(new ErrorResponse('No pending approval found for this approver', 400));
    }
    
    // Update the step
    workflow.steps[currentStepIndex].status = 'approved';
    workflow.steps[currentStepIndex].comments = comment;
    workflow.steps[currentStepIndex].actionAt = new Date();
    
    // Check if this was the last step
    const allApproved = workflow.steps.every(step => step.status === 'approved');
    
    if (allApproved) {
      workflow.status = 'completed';
      workflow.currentStep = workflow.steps.length;
      
      // Update expense status
      await Expense.findByIdAndUpdate(workflow.expenseId, {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date(),
        approvalComments: comment
      });
      
      // Notify the submitter
      await Notification.create({
        userId: workflow.submittedBy,
        companyId: workflow.companyId,
        type: 'expense_approved',
        title: 'Expense Approved',
        message: 'Your expense has been approved through the workflow',
        data: { expenseId: workflow.expenseId }
      });
    } else {
      // Move to next step
      workflow.currentStep = currentStepIndex + 1;
      
      // Notify next approver
      const nextStep = workflow.steps.find(step => step.status === 'pending');
      if (nextStep) {
        await Notification.create({
          userId: nextStep.approverId,
          companyId: workflow.companyId,
          type: 'approval_required',
          title: 'Approval Required',
          message: 'You have a new expense to approve',
          data: { expenseId: workflow.expenseId, workflowId: workflow._id }
        });
      }
    }
    
    await workflow.save();
    
    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject workflow step
// @route   PUT /api/workflow/:expenseId/reject
// @access  Approver
exports.rejectWorkflowStep = async (req, res, next) => {
  try {
    const { approverId, comment } = req.body;
    
    const workflow = await Workflow.findOne({ expenseId: req.params.expenseId });
    
    if (!workflow) {
      return next(new ErrorResponse('Workflow not found', 404));
    }
    
    // Find the current step for this approver
    const currentStepIndex = workflow.steps.findIndex(
      step => step.approverId.toString() === approverId && step.status === 'pending'
    );
    
    if (currentStepIndex === -1) {
      return next(new ErrorResponse('No pending approval found for this approver', 400));
    }
    
    // Update the step
    workflow.steps[currentStepIndex].status = 'rejected';
    workflow.steps[currentStepIndex].comments = comment;
    workflow.steps[currentStepIndex].actionAt = new Date();
    
    // Reject the entire workflow
    workflow.status = 'rejected';
    
    // Update expense status
    await Expense.findByIdAndUpdate(workflow.expenseId, {
      status: 'rejected',
      approvedBy: approverId,
      approvedAt: new Date(),
      rejectionReason: comment
    });
    
    // Notify the submitter
    await Notification.create({
      userId: workflow.submittedBy,
      companyId: workflow.companyId,
      type: 'expense_rejected',
      title: 'Expense Rejected',
      message: 'Your expense has been rejected through the workflow',
      data: { expenseId: workflow.expenseId, reason: comment }
    });
    
    await workflow.save();
    
    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate approval
// @route   PUT /api/workflow/:expenseId/escalate
// @access  Manager / Admin
exports.escalateApproval = async (req, res, next) => {
  try {
    const { fromId, toId, comment } = req.body;
    
    const workflow = await Workflow.findOne({ expenseId: req.params.expenseId });
    
    if (!workflow) {
      return next(new ErrorResponse('Workflow not found', 404));
    }
    
    // Find the step to escalate
    const stepIndex = workflow.steps.findIndex(
      step => step.approverId.toString() === fromId && step.status === 'pending'
    );
    
    if (stepIndex === -1) {
      return next(new ErrorResponse('No pending approval found for this approver', 400));
    }
    
    // Update the step
    workflow.steps[stepIndex].status = 'escalated';
    workflow.steps[stepIndex].escalatedTo = toId;
    workflow.steps[stepIndex].comments = comment;
    workflow.steps[stepIndex].actionAt = new Date();
    
    // Update workflow status
    workflow.status = 'escalated';
    
    // Notify the escalated user
    await Notification.create({
      userId: toId,
      companyId: workflow.companyId,
      type: 'expense_escalated',
      title: 'Expense Escalated',
      message: 'An expense has been escalated to you for approval',
      data: { expenseId: workflow.expenseId, workflowId: workflow._id }
    });
    
    await workflow.save();
    
    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};
