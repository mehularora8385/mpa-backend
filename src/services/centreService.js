const db = require("../config/database");

exports.checkCapacity = async (centreId) => {
  const result = await db.query(
    "SELECT capacity, (SELECT COUNT(*) FROM candidates WHERE centre_id = $1) as current_count FROM centres WHERE id = $1",
    [centreId]
  );
  return result.rows[0];
};
