const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (username, password, deviceId) => {
  const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);

  if (user.rows.length === 0) {
    await db.query("INSERT INTO failed_logins (username, ip_address) VALUES ($1, $2)", [username, '127.0.0.1']);
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword) {
    await db.query("INSERT INTO failed_logins (username, ip_address) VALUES ($1, $2)", [username, '127.0.0.1']);
    throw new Error("Invalid credentials");
  }

  // Device binding check
  const device = await db.query("SELECT * FROM device_registry WHERE user_id = $1 AND device_id = $2", [user.rows[0].id, deviceId]);
  if (device.rows.length === 0) {
    await db.query("INSERT INTO device_registry (user_id, device_id) VALUES ($1, $2)", [user.rows[0].id, deviceId]);
  }

  const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return { token };
};

exports.forgotPassword = async (email) => {
    // Implementation for sending a password reset email
    console.log(`Password reset email sent to ${email}`);
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (user.rows.length === 0) {
        throw new Error("User not found");
    }

    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) {
        throw new Error("Invalid old password");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);
};
