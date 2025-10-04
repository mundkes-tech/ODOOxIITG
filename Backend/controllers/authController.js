const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user (first user becomes admin)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  const { name, email, password, companyName, country, currency } = req.body;

  try {
    // Check if user with email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Check if this is the first user (will be admin) OR if we're in development mode
    const isFirstUser = (await User.countDocuments({})) === 0;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let company;
    
    // If first user OR development mode, allow signup
    if (isFirstUser || isDevelopment) {
      // In development, check if company already exists for this user
      if (isDevelopment && !isFirstUser) {
        // Find existing company or create new one
        company = await Company.findOne({ name: companyName });
        if (!company) {
          company = await Company.create({
            name: companyName,
            country: country || 'US',
            currency: currency || 'USD'
          });
        }
      } else {
        // First user - create new company
        company = await Company.create({
          name: companyName,
          country: country || 'US',
          currency: currency || 'USD'
        });
      }
    } else {
      // For subsequent users in production, they need to be invited by an admin
      return next(new ErrorResponse('Please contact your administrator to create an account', 401));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : (isDevelopment ? 'admin' : 'employee'), // First user or dev mode = admin
      companyId: company._id,
      isAdmin: isFirstUser || isDevelopment
    });

    // Generate JWT
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is provided
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Check that user exists by email and select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate JWT
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new ErrorResponse('Please provide refresh token', 400));
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Generate new access token
    const token = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Authenticated
exports.logout = async (req, res, next) => {
  try {
    // In a real implementation, you would:
    // 1. Add the token to a blacklist
    // 2. Remove refresh token from user record
    // 3. Clear any session data
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add getSignedJwtToken method to the User schema
User.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role, companyId: this.companyId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Add getRefreshToken method to the User schema
User.prototype.getRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};