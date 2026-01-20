const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const authMiddleware = require('../middlewares/authMiddleware');

// All sync routes require authentication
router.use(authMiddleware);

// Sync device data
router.post('/device/:examId', syncController.syncDeviceData);

// Get sync status for operator
router.get('/status/:examId', syncController.getSyncStatus);

// Retry failed syncs
router.post('/retry/:examId', syncController.retryFailedSyncs);

// Admin routes
router.get('/admin/trigger/:examId', syncController.triggerSyncAll);
router.get('/admin/conflicts/:examId', syncController.getExamConflicts);
router.post('/admin/resolve/:conflictId', syncController.resolveConflict);
router.get('/admin/statistics/:examId', syncController.getStatistics);
router.delete('/admin/cleanup', syncController.cleanup);

module.exports = router;