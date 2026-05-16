const bcrypt = require("bcryptjs");
const { pool, query } = require("../../config/db");
const env = require("../../config/env");
const ApiError = require("../../utils/api-error");
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require("../../utils/token");
const userService = require("../users/user.service");
const { ROLES } = require("../../constants/roles");

const toAuthUser = (user) => userService.sanitizeUser(user);

const buildAuthPayload = (user, accessToken) => ({
  user: toAuthUser(user),
  accessToken
});

const registerIntern = async ({ fullName, email, password }) => {
  return userService.createUser({
    fullName,
    email,
    password,
    role: ROLES.INTERN
  });
};

const buildRefreshSessionExpiry = () => new Date(Date.now() + env.REFRESH_COOKIE_MAX_AGE_MS);

const createSession = async (client, { userId, sessionId, refreshToken, userAgent, ipAddress }) => {
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = buildRefreshSessionExpiry();

  await client.query(
    `
      INSERT INTO refresh_sessions (id, user_id, refresh_token_hash, user_agent, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [sessionId, userId, refreshTokenHash, userAgent || null, ipAddress || null, expiresAt]
  );
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  const user = await userService.findUserByEmailWithPassword(email);

  if (!user || !user.is_active) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const accessToken = signAccessToken(user);
    const sessionIdResult = await client.query("SELECT gen_random_uuid() AS id");
    const sessionId = sessionIdResult.rows[0].id;
    const refreshToken = signRefreshToken(user, sessionId);

    await createSession(client, {
      userId: user.id,
      sessionId,
      refreshToken,
      userAgent,
      ipAddress
    });

    await client.query("COMMIT");

    return {
      ...buildAuthPayload(user, accessToken),
      refreshToken
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const refreshSession = async ({ refreshToken, userAgent, ipAddress }) => {
  let tokenPayload;

  try {
    tokenPayload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const sessionResult = await client.query(
      `
        SELECT id, user_id, refresh_token_hash, expires_at, revoked_at
        FROM refresh_sessions
        WHERE id = $1
      `,
      [tokenPayload.sid]
    );

    const session = sessionResult.rows[0];
    if (!session || session.revoked_at || hashToken(refreshToken) !== session.refresh_token_hash) {
      throw new ApiError(401, "Refresh session is invalid");
    }

    if (new Date(session.expires_at).getTime() <= Date.now()) {
      throw new ApiError(401, "Refresh session has expired");
    }

    const user = await userService.findUserById(tokenPayload.sub);
    if (!user || !user.is_active) {
      throw new ApiError(401, "Authenticated user is no longer active");
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user, tokenPayload.sid);
    const newRefreshTokenHash = hashToken(newRefreshToken);
    const expiresAt = buildRefreshSessionExpiry();

    await client.query(
      `
        UPDATE refresh_sessions
        SET refresh_token_hash = $2,
            user_agent = $3,
            ip_address = $4,
            expires_at = $5
        WHERE id = $1
      `,
      [tokenPayload.sid, newRefreshTokenHash, userAgent || null, ipAddress || null, expiresAt]
    );

    await client.query("COMMIT");

    return {
      ...buildAuthPayload(user, newAccessToken),
      refreshToken: newRefreshToken
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  try {
    const tokenPayload = verifyRefreshToken(refreshToken);
    await query(
      `
        UPDATE refresh_sessions
        SET revoked_at = NOW()
        WHERE id = $1 AND user_id = $2 AND refresh_token_hash = $3
      `,
      [tokenPayload.sid, tokenPayload.sub, hashToken(refreshToken)]
    );
  } catch (error) {
    return;
  }
};

module.exports = {
  registerIntern,
  login,
  refreshSession,
  logout
};
