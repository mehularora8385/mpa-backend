const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Report routes
router.get('/biometric', reportController.getBiometricReport);
router.get('/centre', reportController.getCentreReport);
router.get('/slot', reportController.getSlotReport);
router.get('/operator', reportController.getOperatorReport);
router.get('/comprehensive', reportController.getComprehensiveReport);
router.get('/detailed-export', reportController.getDetailedExportReport);

// Download routes (same data, different format indication)
router.get('/biometric/download', reportController.getBiometricReport);
router.get('/centre/download', reportController.getCentreReport);

module.exports = router;