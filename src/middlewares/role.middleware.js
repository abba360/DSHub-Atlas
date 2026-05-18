const ApiError = require("../utils/api-error");


const authorizeRoles = (...allowedRoles) => {
  // Fail fast at startup if called with no roles — developer error
  if (allowedRoles.length === 0) {
    throw new Error("authorizeRoles() requires at least one role argument");
  }

  return (req, res, next) => {
    // requireAuth must have run first
    if (!req.auth) {
      return next(new ApiError(401, "Authentication is required"));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }

    return next();
  };
};

module.exports = authorizeRoles;