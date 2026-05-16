const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access"
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );

const signRefreshToken = (user, sessionId) =>
  jwt.sign(
    {
      sub: user.id,
      sid: sessionId,
      type: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: env.REFRESH_COOKIE_MAX_AGE_MS,
  path: "/api/v1/auth"
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshCookieOptions
};
