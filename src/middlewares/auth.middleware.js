const ApiError = require("../utils/api-error");
const { verifyAccessToken } = require("../utils/token");
const userService = require("../modules/users/user.service");

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

const requireAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next(new ApiError(401, "Access token is missing"));
    }

    const payload = verifyAccessToken(token);
    const user = await userService.findUserById(payload.sub);

    if (!user || !user.is_active) {
      return next(new ApiError(401, "Authenticated user is no longer active"));
    }

    req.auth = {
      userId: user.id,
      role: user.role,
      email: user.email
    };

    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
};

module.exports = requireAuth;
