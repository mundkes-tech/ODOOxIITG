const express = require('express');
const router = express.Router();
const {
  createWorkflow,
  getWorkflow,
  approveWorkflowStep,
  rejectWorkflowStep,
  escalateApproval
} = require('../controllers/workflowController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   POST /api/workflow/
router.post('/', authorize('admin'), createWorkflow);

// @route   GET /api/workflow/:expenseId
router.get('/:expenseId', authorize('employee', 'manager', 'admin'), getWorkflow);

// @route   PUT /api/workflow/:expenseId/approve
router.put('/:expenseId/approve', authorize('manager', 'admin'), approveWorkflowStep);

// @route   PUT /api/workflow/:expenseId/reject
router.put('/:expenseId/reject', authorize('manager', 'admin'), rejectWorkflowStep);

// @route   PUT /api/workflow/:expenseId/escalate
router.put('/:expenseId/escalate', authorize('manager', 'admin'), escalateApproval);

module.exports = router;
