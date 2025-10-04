const ErrorResponse = require('../utils/errorResponse');

// Validation middleware for request body
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    
    next();
  };
};

// Validation middleware for query parameters
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    
    next();
  };
};

// Validation middleware for route parameters
exports.validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    
    next();
  };
};
