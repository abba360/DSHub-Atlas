const bcrypt = require("bcryptjs");
const { query, pool } = require("../../config/db");
const env = require("../../config/env");
const ApiError = require("../../utils/api-error");
const { ROLES } = require("../../constants/roles");

const publicUserColumns = `
  id,
  full_name,
  email,
  role,
  is_active,
  created_at,
  updated_at
`;

const sanitizeUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const emailExists = async (email) => {
  const result = await query("SELECT 1 FROM users WHERE email = $1", [email.toLowerCase()]);
  return result.rowCount > 0;
};

const createUser = async ({ fullName, email, password, role = ROLES.INTERN }) => {
  if (await emailExists(email)) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const result = await query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING ${publicUserColumns}
    `,
    [fullName, email.toLowerCase(), passwordHash, role]
  );

  return sanitizeUser(result.rows[0]);
};

const createUserWithClient = async (client, { fullName, email, password, role = ROLES.INTERN }) => {
  const existing = await client.query("SELECT 1 FROM users WHERE email = $1", [email.toLowerCase()]);
  if (existing.rowCount > 0) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const result = await client.query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING ${publicUserColumns}
    `,
    [fullName, email.toLowerCase(), passwordHash, role]
  );

  return result.rows[0];
};

const findUserByEmailWithPassword = async (email) => {
  const result = await query(
    `
      SELECT id, full_name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
};

const findUserById = async (userId) => {
  const result = await query(
    `
      SELECT ${publicUserColumns}
      FROM users
      WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

const listUsers = async () => {
  const result = await query(
    `
      SELECT ${publicUserColumns}
      FROM users
      ORDER BY created_at DESC
    `
  );

  return result.rows.map(sanitizeUser);
};

const seedAdminIfMissing = async ({ fullName, email, password }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT 1 FROM users WHERE role = $1 LIMIT 1", [ROLES.ADMIN]);
    if (existing.rowCount === 0) {
      await createUserWithClient(client, {
        fullName,
        email,
        password,
        role: ROLES.ADMIN
      });
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  sanitizeUser,
  createUser,
  createUserWithClient,
  findUserByEmailWithPassword,
  findUserById,
  listUsers,
  seedAdminIfMissing
};
