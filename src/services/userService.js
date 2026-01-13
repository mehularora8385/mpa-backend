const db = require("../config/database");

exports.updateProfile = async (userId, profileData) => {
  const { name, email } = profileData;
  const result = await db.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, userId]
  );
  return result.rows[0];
};

exports.updateRole = async (userId, newRole) => {
  const result = await db.query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
    [newRole, userId]
  );
  return result.rows[0];
};
