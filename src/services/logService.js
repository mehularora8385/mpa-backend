const db = require("../config/database");

exports.getLogs = async (filter) => {
  let query = "SELECT * FROM api_logs";
  if (filter) {
    query += ` WHERE ${filter}`;
  }
  const result = await db.query(query);
  return result.rows;
};
