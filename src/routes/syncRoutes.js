const express = require("express");
const router = express.Router();
const syncController = require("../controllers/syncController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/biometrics", authMiddleware, syncController.syncBiometrics);

module.exports = router;
