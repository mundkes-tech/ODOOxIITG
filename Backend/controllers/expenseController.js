const Expense = require('../models/Expense');
const Workflow = require('../models/Workflow');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit new expense
// @route   POST /api/expenses/
// @access  Employee
exports.submitExpense = async (req, res, next) => {
  try {
    const { amount, currency, category, description, date, receiptUrl } = req.body;
    
    const expense = await Expense.create({
      amount,
      currency,
      category,
      description,
      date: date || new Date(),
      receiptUrl,
      submittedBy: req.user.id,
      companyId: req.user.companyId
    });
    
    // Create notification for managers/admins
    await Notification.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      type: 'expense_submitted',
      title: 'New Expense Submitted',
      message: `New expense of ${amount} ${currency} submitted for approval`,
      data: { expenseId: expense._id }
    });
    
    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user's expenses
// @route   GET /api/expenses/
// @access  Employee
exports.getUserExpenses = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = { submittedBy: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const expenses = await Expense.find(query)
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense details
// @route   GET /api/expenses/:id
// @access  Employee / Manager / Admin
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    // Check if user has access to this expense
    if (req.user.role === 'employee' && expense.submittedBy._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this expense', 403));
    }
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit expense (before approval)
// @route   PUT /api/expenses/:id
// @access  Employee
exports.editExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    // Check if user owns this expense
    if (expense.submittedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to edit this expense', 403));
    }
    
    // Check if expense is still pending
    if (expense.status !== 'pending') {
      return next(new ErrorResponse('Cannot edit approved or rejected expense', 400));
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, description, date },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Employee
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    // Check if user owns this expense
    if (expense.submittedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this expense', 403));
    }
    
    // Check if expense is still pending
    if (expense.status !== 'pending') {
      return next(new ErrorResponse('Cannot delete approved or rejected expense', 400));
    }
    
    await Expense.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve expense
// @route   PUT /api/expenses/:id/approve
// @access  Manager / Admin
exports.approveExpense = async (req, res, next) => {
  try {
    const { comment } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    if (expense.status !== 'pending') {
      return next(new ErrorResponse('Expense is not pending for approval', 400));
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        approvalComments: comment
      },
      { new: true }
    );
    
    // Create notification for the employee
    await Notification.create({
      userId: expense.submittedBy,
      companyId: expense.companyId,
      type: 'expense_approved',
      title: 'Expense Approved',
      message: `Your expense of ${expense.amount} ${expense.currency} has been approved`,
      data: { expenseId: expense._id }
    });
    
    res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject expense
// @route   PUT /api/expenses/:id/reject
// @access  Manager / Admin
exports.rejectExpense = async (req, res, next) => {
  try {
    const { comment } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    if (expense.status !== 'pending') {
      return next(new ErrorResponse('Expense is not pending for approval', 400));
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: comment
      },
      { new: true }
    );
    
    // Create notification for the employee
    await Notification.create({
      userId: expense.submittedBy,
      companyId: expense.companyId,
      type: 'expense_rejected',
      title: 'Expense Rejected',
      message: `Your expense of ${expense.amount} ${expense.currency} has been rejected`,
      data: { expenseId: expense._id, reason: comment }
    });
    
    res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate expense
// @route   PUT /api/expenses/:id/escalate
// @access  Manager / Admin
exports.escalateExpense = async (req, res, next) => {
  try {
    const { comment, escalateTo } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return next(new ErrorResponse('Expense not found', 404));
    }
    
    if (expense.status !== 'pending') {
      return next(new ErrorResponse('Expense is not pending for approval', 400));
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'escalated',
        approvedBy: escalateTo,
        approvalComments: comment
      },
      { new: true }
    );
    
    // Create notification for the escalated user
    await Notification.create({
      userId: escalateTo,
      companyId: expense.companyId,
      type: 'expense_escalated',
      title: 'Expense Escalated',
      message: `An expense has been escalated to you for approval`,
      data: { expenseId: expense._id, escalatedBy: req.user.id }
    });
    
    res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense history for a specific employee
// @route   GET /api/expenses/history
// @access  Manager / Admin
exports.getExpenseHistory = async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return next(new ErrorResponse('Please provide userId', 400));
    }
    
    const expenses = await Expense.find({ 
      submittedBy: userId,
      companyId: req.user.companyId 
    })
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};
