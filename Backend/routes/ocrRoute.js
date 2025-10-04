const express = require('express');
const router = express.Router();
const {
  uploadReceipt,
  getOCRData
} = require('../controllers/ocrController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   POST /api/ocr/upload
router.post('/upload', authorize('employee', 'manager', 'admin'), uploadReceipt);

// @route   GET /api/ocr/:id
router.get('/:id', authorize('employee', 'manager', 'admin'), getOCRData);

module.exports = router;
