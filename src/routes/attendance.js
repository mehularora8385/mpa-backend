const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.put("/correct", attendanceController.correctAttendance);

module.exports = router;
