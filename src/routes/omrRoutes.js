const express = require("express");
const router = express.Router();
const omrController = require("../controllers/omrController");
const authMiddleware = require("../middlewares/authMiddleware");

// Operator-accessible routes for OMR scanning
router.use(authMiddleware);

// Scan and validate an OMR barcode
router.post("/scan", omrController.scanOMR);

// Get OMR validation status for a candidate
router.get("/status/:candidateId", omrController.getOMRStatus);

module.exports = router;
