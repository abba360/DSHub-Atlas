const ApiError = require("../utils/api-error");

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.auth) {
    return next(new ApiError(401, "Authentication is required"));
  }

  if (!allowedRoles.includes(req.auth.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }

  return next();
};

module.exports = authorizeRoles;
