const db = require("../config/database");

const ipBlocker = async (req, res, next) => {
  const ip = req.ip;
  const blockedIps = await db.query("SELECT * FROM blocked_ips WHERE ip_address = $1", [ip]);
  if (blockedIps.rows.length > 0) {
    return res.status(403).json({ message: "IP blocked" });
  }
  next();
};

module.exports = ipBlocker;
