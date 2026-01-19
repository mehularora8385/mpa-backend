const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifyDownloadPassword } = require('../middlewares/downloadPasswordAuth');

// All routes require authentication
router.use(authMiddleware);

// Trigger backup (requires download password)
router.post('/trigger', 
  verifyDownloadPassword,
  backupController.trigger
);

module.exports = router;