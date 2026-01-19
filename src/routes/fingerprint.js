const express = require('express');
const router = express.Router();
const fingerprintController = require('../controllers/fingerprintController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Capture fingerprint (operator)
router.post('/capture',
  fingerprintController.upload.single('fingerprintImage'),
  fingerprintController.captureFingerprint
);

// Get fingerprint status
router.get('/status/:candidateId/:examId', fingerprintController.getFingerprintStatus);

// Delete fingerprint (admin only)
router.delete('/:fingerprintId', fingerprintController.deleteFingerprint);

// List fingerprints for exam (admin only)
router.get('/list/:examId', fingerprintController.listFingerprints);

module.exports = router;