const env = require("../../config/env");
const asyncHandler = require("../../utils/async-handler");
const { refreshCookieOptions } = require("../../utils/token");
const authService = require("./auth.service");
const userService = require("../users/user.service");

const attachRefreshCookie = (res, refreshToken) => {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
    path: refreshCookieOptions.path
  });
};

const getRefreshTokenFromRequest = (req) =>
  req.cookies?.[env.REFRESH_COOKIE_NAME] || req.body?.refreshToken || null;

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerIntern(req.validated.body);

  res.status(201).json({
    success: true,
    message: "Intern account created successfully",
    data: user
  });
});

const login = asyncHandler(async (req, res) => {
  const session = await authService.login({
    ...req.validated.body,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip
  });

  attachRefreshCookie(res, session.refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  const session = await authService.refreshSession({
    refreshToken,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip
  });

  attachRefreshCookie(res, session.refreshToken);

  res.status(200).json({
    success: true,
    message: "Session refreshed successfully",
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  await authService.logout(refreshToken);
  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful"
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await userService.findUserById(req.auth.userId);

  res.status(200).json({
    success: true,
    message: "Current user retrieved successfully",
    data: userService.sanitizeUser(user)
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
