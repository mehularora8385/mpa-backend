const db = require("../config/database");

exports.correctAttendance = async (attendanceId, correctionData) => {
    const { status } = correctionData;
    await db.query("UPDATE attendance SET status = $1 WHERE id = $2", [status, attendanceId]);
};
