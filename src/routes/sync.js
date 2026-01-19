const express = require('express');
const router = express.Router();
const syncConflictController = require('../controllers/syncConflictController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Sync data with conflict detection
router.post('/upload', syncConflictController.syncData);

// Resolve conflict (admin only)
router.post('/resolve/:conflictId', syncConflictController.resolveConflict);

// Get conflicts for exam
router.get('/conflicts/:examId', syncConflictController.getConflicts);

// Get sync status for operator
router.get('/status/:examId', syncConflictController.getSyncStatus);

// Get all sync statuses (admin only)
router.get('/all/:examId', syncConflictController.getAllSyncStatuses);

module.exports = router;