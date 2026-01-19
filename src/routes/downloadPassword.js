const express = require('express');
const router = express.Router();
const downloadPasswordController = require('../controllers/downloadPasswordController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkActivePassword } = require('../middlewares/downloadPasswordAuth');

// All routes require authentication
router.use(authMiddleware);

// Generate download password (admin only)
router.post('/generate', downloadPasswordController.generatePassword);

// Verify download password (operator)
router.post('/verify', downloadPasswordController.verifyPassword);

// Get password status (admin)
router.get('/status/:examId', downloadPasswordController.getPasswordStatus);

// Regenerate password (admin only)
router.post('/regenerate', downloadPasswordController.regeneratePassword);

module.exports = router;