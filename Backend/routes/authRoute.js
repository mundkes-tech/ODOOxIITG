const express = require('express');
const router = express.Router();
const { signup, login, getMe, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected route - requires authentication
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;