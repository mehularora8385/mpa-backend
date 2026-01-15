const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/exam/:examId", authMiddleware, slotController.getSlotsByExam);
router.post("/", authMiddleware, slotController.createSlot);

module.exports = router;
