const db = require("../config/database");

const requestLogger = async (req, res, next) => {
  const { method, url, ip } = req;
  const user_id = req.user ? req.user.id : null;
  await db.query(
    "INSERT INTO api_logs (method, url, ip_address, user_id) VALUES ($1, $2, $3, $4)",
    [method, url, ip, user_id]
  );
  next();
};

module.exports = requestLogger;
