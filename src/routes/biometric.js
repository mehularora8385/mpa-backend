const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometricController');
const authMiddleware = require('../middlewares/authMiddleware');
const { enforceAttendanceFirst } = require('../middlewares/biometricEnforcement');

// All routes require authentication
router.use(authMiddleware);

// Biometric verification (requires attendance first)
router.post('/verify', 
  enforceAttendanceFirst,
  biometricController.reverify
);

module.exports = router;