const db = require("../config/database");

const ipBlocker = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    const query =
      "SELECT * FROM blocked_ips WHERE ip_address = $1";

    const result = await db.query(query, [ip]);

    if (result.rows.length > 0) {
      return res.status(403).json({
        message: "IP blocked",
      });
    }

    next();
  } catch (err) {
    console.error("IP Blocker Error:", err);
    next();
  }
};

module.exports = ipBlocker;

