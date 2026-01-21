const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Mark present
router.post("/present", attendanceController.markPresent);

// Verify candidate
router.post("/verify", attendanceController.verifyCandidate);

// Correction
router.put("/correct", attendanceController.correct);

module.exports = router;

