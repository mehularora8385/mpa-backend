const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Dashboard routes
router.get('/stats', dashboardController.getStats);
router.get('/centres', dashboardController.getCentreData);
router.get('/exam/:examId', dashboardController.getExamStats);
router.get('/updates', dashboardController.getRealTimeUpdates);

module.exports = router;