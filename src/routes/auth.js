const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

// Public routes
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

// Protected routes
router.post("/logout", authMiddleware, authController.logout);
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
