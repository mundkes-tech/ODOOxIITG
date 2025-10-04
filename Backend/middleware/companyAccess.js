const ErrorResponse = require('../utils/errorResponse');

// Middleware to ensure user can only access resources from their company
exports.checkCompanyAccess = (req, res, next) => {
  // This middleware should be used after protect middleware
  // It ensures that users can only access resources from their own company
  
  if (!req.user || !req.user.companyId) {
    return next(new ErrorResponse('User company not found', 400));
  }
  
  // If the request has a companyId parameter, check if it matches user's company
  if (req.params.companyId && req.params.companyId !== req.user.companyId.toString()) {
    return next(new ErrorResponse('Not authorized to access this company resource', 403));
  }
  
  next();
};

// Middleware to check if user can access a specific resource
exports.checkResourceAccess = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return next(new ErrorResponse('Resource not found', 404));
      }
      
      // Check if resource belongs to user's company
      if (resource.companyId && resource.companyId.toString() !== req.user.companyId.toString()) {
        return next(new ErrorResponse('Not authorized to access this resource', 403));
      }
      
      // For user-specific resources, check if user owns the resource
      if (resource.submittedBy && resource.submittedBy.toString() !== req.user.id.toString()) {
        // Allow managers and admins to access all resources in their company
        if (!['manager', 'admin'].includes(req.user.role)) {
          return next(new ErrorResponse('Not authorized to access this resource', 403));
        }
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
