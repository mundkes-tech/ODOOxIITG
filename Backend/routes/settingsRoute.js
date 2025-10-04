const express = require('express');
const router = express.Router();
const {
  getApprovalRules,
  addApprovalRule,
  updateApprovalRule,
  deleteApprovalRule
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/settings/approval-rules
router.get('/approval-rules', getApprovalRules);

// @route   POST /api/settings/approval-rules
router.post('/approval-rules', addApprovalRule);

// @route   PUT /api/settings/approval-rules/:id
router.put('/approval-rules/:id', updateApprovalRule);

// @route   DELETE /api/settings/approval-rules/:id
router.delete('/approval-rules/:id', deleteApprovalRule);

module.exports = router;
