const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Candidate CRUD operations
router.get('/', candidateController.getAllCandidates);
router.get('/filter', candidateController.filterCandidates);
router.get('/exam/:examId', candidateController.getCandidatesByExam);
router.get('/centre/:centreCode', candidateController.getCandidatesByCentre);
router.get('/roll/:rollNo', candidateController.getCandidateByRollNo);
router.get('/:id', candidateController.getCandidateById);
router.post('/', candidateController.createCandidate);
router.put('/:id', candidateController.updateCandidate);

// Biometric operations
router.get('/:id/biometric-status', candidateController.getBiometricStatus);
router.put('/:id/status', candidateController.updateStatus);
router.post('/:id/reverify', candidateController.reverifyCandidate);

module.exports = router;