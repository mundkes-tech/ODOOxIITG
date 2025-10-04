const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Role-based middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    return next(new ErrorResponse('Admin access required', 403));
  }
};

exports.isManager = (req, res, next) => {
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    next();
  } else {
    return next(new ErrorResponse('Manager access required', 403));
  }
};

exports.isEmployee = (req, res, next) => {
  if (['employee', 'manager', 'admin'].includes(req.user.role)) {
    next();
  } else {
    return next(new ErrorResponse('Employee access required', 403));
  }
};