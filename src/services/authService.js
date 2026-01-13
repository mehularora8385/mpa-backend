
exports.verifyDevice = async (userId, deviceId) => {
  const result = await db.query(
    "SELECT * FROM device_registry WHERE operator_id = $1 AND device_id = $2",
    [userId, deviceId]
  );

  if (result.rows.length === 0) {
    throw new Error("Device not registered for this user");
  }

  return true;
};
