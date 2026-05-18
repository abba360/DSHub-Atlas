const ApiError       = require("../utils/api-error");
const { verifyAccessToken } = require("../utils/token");
const userService    = require("../modules/users/user.service");


const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) return null;
  const token = authorizationHeader.slice(7).trim();
  return token.length > 0 ? token : null;
};

const requireAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next(new ApiError(401, "Access token is missing"));
    }

    // Throws if token is expired or signature is invalid
    const payload = verifyAccessToken(token);

    // Re-validate against DB — catches deactivated accounts mid-session
    const user = await userService.findUserById(payload.sub);

    // FIX: sanitizeUser() returns isActive (camelCase), not is_active
    if (!user || !user.isActive) {
      return next(new ApiError(401, "Authenticated user is no longer active"));
    }

    // Minimal surface area — only expose what downstream handlers need
    req.auth = {
      userId: user.id,
      role:   user.role,
      email:  user.email,
    };

    return next();
  } catch (error) {
    // Covers jwt.verify() throwing TokenExpiredError / JsonWebTokenError
    return next(new ApiError(401, "Invalid or expired access token"));
  }
};

module.exports = requireAuth;