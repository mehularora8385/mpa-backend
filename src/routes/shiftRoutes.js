const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const authMiddleware = require("../middlewares/authMiddleware");

// Admin-only routes for shift management
router.use(authMiddleware); // Protect all shift routes

// Start a shift and lock others
router.post("/exam/:examId/shift/:shiftId/start", shiftController.startShift);

// End a shift
router.post("/shift/:shiftId/end", shiftController.endShift);

// Get status of all shifts for an exam
router.get("/exam/:examId/shifts", shiftController.getShiftStatus);

module.exports = router;
