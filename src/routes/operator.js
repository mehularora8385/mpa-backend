const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");
const authMiddleware = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Bulk upload operators
router.post("/upload", operatorController.bulkUpload);

// Logout all operators (for admin panel)
router.post("/logout-all", operatorController.logoutAll);

module.exports = router;
