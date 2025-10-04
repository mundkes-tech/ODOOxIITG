const express = require('express');
const router = express.Router();
const {
  submitExpense,
  getUserExpenses,
  getCompanyExpenses,
  getExpense,
  editExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  escalateExpense,
  getExpenseHistory
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   POST /api/expenses/
router.post('/', authorize('employee', 'manager', 'admin'), submitExpense);

// @route   GET /api/expenses/
router.get('/', authorize('employee', 'manager', 'admin'), getUserExpenses);

// @route   GET /api/expenses/company
router.get('/company', authorize('manager', 'admin'), getCompanyExpenses);

// @route   GET /api/expenses/history
router.get('/history', authorize('manager', 'admin'), getExpenseHistory);

// @route   GET /api/expenses/:id
router.get('/:id', authorize('employee', 'manager', 'admin'), getExpense);

// @route   PUT /api/expenses/:id
router.put('/:id', authorize('employee', 'manager', 'admin'), editExpense);

// @route   DELETE /api/expenses/:id
router.delete('/:id', authorize('employee', 'manager', 'admin'), deleteExpense);

// @route   PUT /api/expenses/:id/approve
router.put('/:id/approve', authorize('manager', 'admin'), approveExpense);

// @route   PUT /api/expenses/:id/reject
router.put('/:id/reject', authorize('manager', 'admin'), rejectExpense);

// @route   PUT /api/expenses/:id/escalate
router.put('/:id/escalate', authorize('manager', 'admin'), escalateExpense);

module.exports = router;
