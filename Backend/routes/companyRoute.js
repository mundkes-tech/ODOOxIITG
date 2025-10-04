const express = require('express');
const router = express.Router();
const {
  getCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/company/
router.get('/', getCompany);

// @route   PUT /api/company/:id
router.put('/:id', authorize('admin'), updateCompany);

// @route   DELETE /api/company/:id
router.delete('/:id', authorize('admin'), deleteCompany);

module.exports = router;
