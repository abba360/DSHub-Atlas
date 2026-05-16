const pool = require("../../config/db");

// CREATE intern
const createIntern = async (data) => {
  const { full_name, email, track, bio, github, linkedin, image_url } = data;

  const result = await pool.query(
    `INSERT INTO interns (full_name, email, track, bio, github, linkedin, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [full_name, email, track, bio, github, linkedin, image_url]
  );

  return result.rows[0];
};

// GET all interns
const getAllInterns = async () => {
  const result = await pool.query(`SELECT * FROM interns ORDER BY created_at DESC`);
  return result.rows;
};

// GET one intern
const getInternById = async (id) => {
  const result = await pool.query(`SELECT * FROM interns WHERE id = $1`, [id]);
  return result.rows[0];
};

// UPDATE intern
const updateIntern = async (id, data) => {
  const { full_name, email, track, bio, github, linkedin, image_url } = data;

  const result = await pool.query(
    `UPDATE interns
     SET full_name=$1, email=$2, track=$3, bio=$4, github=$5, linkedin=$6, image_url=$7
     WHERE id=$8
     RETURNING *`,
    [full_name, email, track, bio, github, linkedin, image_url, id]
  );

  return result.rows[0];
};

// DELETE intern
const deleteIntern = async (id) => {
  await pool.query(`DELETE FROM interns WHERE id = $1`, [id]);
  return true;
};

module.exports = {
  createIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern,
};