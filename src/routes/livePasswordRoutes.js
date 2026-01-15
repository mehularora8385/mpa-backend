const express = require("express");
const router = express.Router();
const livePasswordController = require("../controllers/livePasswordController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/generate", authMiddleware, livePasswordController.generatePassword);
router.post("/validate", livePasswordController.validatePassword);

module.exports = router;
