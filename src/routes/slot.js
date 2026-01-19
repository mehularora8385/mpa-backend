const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create new slot (admin only)
router.post('/', slotController.createSlot);

// Assign operator to slot (admin only)
router.post('/assign', slotController.assignOperator);

// Get operator's assigned slots
router.get('/operator/:examId', slotController.getOperatorSlots);

// Filter candidates by operator's slot
router.get('/candidates/:examId', 
  authMiddleware,
  slotController.filterCandidates
);

// Update slot status (admin only)
router.patch('/:slotId/status', slotController.updateStatus);

// Get all slots for exam
router.get('/exam/:examId', slotController.getExamSlots);

// Remove operator from slot (admin only)
router.delete('/assign', slotController.removeOperator);

module.exports = router;