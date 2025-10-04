const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      companyId: req.user.companyId, // User is created in the same company as admin
      managerId: role === 'employee' ? (managerId || req.user._id) : null
    });

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin/Manager)
// @route   GET /api/users
// @access  Private/Admin/Manager
exports.getUsers = async (req, res, next) => {
  try {
    let query;
    
    // If user is admin, get all users in the company
    if (req.user.role === 'admin') {
      query = User.find({ companyId: req.user.companyId });
    } 
    // If user is manager, get their team members
    else if (req.user.role === 'manager') {
      query = User.find({ 
        $or: [
          { companyId: req.user.companyId, role: 'employee' },
          { managerId: req.user._id }
        ]
      });
    } 
    // Regular employees can only see their own profile
    else {
      query = User.findById(req.user._id);
    }

    const users = await query.select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user (Admin/Manager/Self)
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is accessing their own data or is admin/manager
    if (
      user._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || user.managerId?.toString() !== req.user._id.toString())
    ) {
      return next(new ErrorResponse('Not authorized to access this user', 401));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin/Manager/Self)
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is updating their own data or is admin
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this user', 401));
    }

    // Only allow certain fields to be updated based on role
    const { name, password, role, managerId } = req.body;
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (password) updateFields.password = password;
    
    // Only admin can update role and managerId
    if (req.user.role === 'admin') {
      if (role) updateFields.role = role;
      if (managerId) updateFields.managerId = managerId;
    }

    user = await User.findByIdAndUpdate(
      req.params.id, 
      updateFields, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Check if user is trying to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return next(new ErrorResponse('Cannot delete your own account', 400));
    }

    // Check if user is in the same company
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return next(new ErrorResponse('Not authorized to delete this user', 401));
    }

    await user.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
