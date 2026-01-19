const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.post("/login", authController.operatorLogin);
router.post("/check-duplicate", authController.checkDuplicate);
router.post("/refresh-token", authController.refreshToken);

// Protected routes (require authentication)
router.use(authMiddleware);

// Operator CRUD operations
router.get("/", operatorController.getAllOperators);
router.get("/:id", operatorController.getOperatorById);
router.post("/", operatorController.createOperator);
router.put("/:id", operatorController.updateOperator);
router.delete("/:id", operatorController.deleteOperator);

// Bulk operations
router.post("/upload", operatorController.bulkUpload);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
