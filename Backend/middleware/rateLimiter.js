const rateLimit = require('express-rate-limit');

// Rate limiting for authentication routes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // More lenient in development
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

// Rate limiting for general API routes
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

// Rate limiting for OCR uploads
exports.ocrLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // More lenient in development
  message: {
    success: false,
    error: 'Too many OCR uploads, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});
