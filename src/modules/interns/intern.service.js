const { query } = require("../../config/db");


const internColumns = `
  id,
  full_name,
  email,
  track,
  bio,
  github,
  linkedin,
  image_url,
  is_active,
  created_at,
  updated_at
`;

// Shape the DB row into a consistent camelCase API object
const sanitizeIntern = (row) => ({
  id:        row.id,
  fullName:  row.full_name,
  email:     row.email,
  track:     row.track,
  bio:       row.bio       ?? null,
  github:    row.github    ?? null,
  linkedin:  row.linkedin  ?? null,
  imageUrl:  row.image_url ?? null,
  isActive:  row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});


const createIntern = async (data) => {
  const { fullName, email, track, bio, github, linkedin, imageUrl } = data;

  const result = await query(
    `INSERT INTO interns (full_name, email, track, bio, github, linkedin, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${internColumns}`,
    [fullName, email.toLowerCase(), track, bio ?? null, github ?? null, linkedin ?? null, imageUrl ?? null]
  );

  return sanitizeIntern(result.rows[0]);
};


const getAllInterns = async ({ track, isActive } = {}) => {
  const conditions = [];
  const values     = [];

  if (track) {
    values.push(track);
    conditions.push(`track = $${values.length}`);
  }

  if (typeof isActive === "boolean") {
    values.push(isActive);
    conditions.push(`is_active = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query(
    `SELECT ${internColumns}
     FROM interns
     ${where}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows.map(sanitizeIntern);
};


const getInternById = async (id) => {
  const result = await query(
    `SELECT ${internColumns} FROM interns WHERE id = $1`,
    [id]
  );

  return result.rows[0] ? sanitizeIntern(result.rows[0]) : null;
};


const updateIntern = async (id, data) => {
  const fieldMap = {
    fullName:  "full_name",
    email:     "email",
    track:     "track",
    bio:       "bio",
    github:    "github",
    linkedin:  "linkedin",
    imageUrl:  "image_url",
    isActive:  "is_active",
  };

  const setClauses = [];
  const values     = [];

  for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(data, jsKey)) {
      values.push(jsKey === "email" ? data[jsKey].toLowerCase() : data[jsKey]);
      setClauses.push(`${dbCol} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) {
    // Nothing to update — fetch and return current state
    return getInternById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE interns
     SET ${setClauses.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${internColumns}`,
    values
  );

  return result.rows[0] ? sanitizeIntern(result.rows[0]) : null;
};


const deleteIntern = async (id) => {
  const result = await query(
    `DELETE FROM interns WHERE id = $1 RETURNING id`,
    [id]
  );

  // Returns true if a row was deleted, false if no record existed
  return result.rowCount > 0;
};

module.exports = {
  sanitizeIntern,
  createIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern,
};