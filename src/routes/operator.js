const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.post("/login", authController.operatorLogin);
router.post("/check-duplicate", authController.checkDuplicate);

// Protected routes
router.post("/upload", authMiddleware, operatorController.bulkUpload);
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
