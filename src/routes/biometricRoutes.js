const express = require("express");
const router = express.Router();
const biometricController = require("../controllers/biometricController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/capture", authMiddleware, biometricController.captureBiometric);
router.post("/verify/:biometricId", authMiddleware, biometricController.verifyBiometric);
router.post("/reverify", authMiddleware, biometricController.reverify);

module.exports = router;
