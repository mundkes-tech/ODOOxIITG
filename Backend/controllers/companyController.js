const Company = require('../models/Company');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get company details
// @route   GET /api/company/
// @access  Authenticated
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company details
// @route   PUT /api/company/:id
// @access  Admin
exports.updateCompany = async (req, res, next) => {
  try {
    const { name, currency, country } = req.body;
    
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, currency, country },
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/company/:id
// @access  Admin
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }
    
    // Delete all users associated with this company
    await User.deleteMany({ companyId: company._id });
    
    // Delete the company
    await Company.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Company and all associated users deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
