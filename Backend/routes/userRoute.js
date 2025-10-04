const express = require('express');
const router = express.Router();
const { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes below this middleware will be protected and require authentication
router.use(protect);

// Admin and manager routes
router
  .route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), createUser);

// User routes (accessible by the user themselves, their manager, or admin)
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
