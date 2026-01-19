const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

// All routes require authentication
router.use(authMiddleware);

// Exam CRUD operations
router.get('/', examController.getAllExams);
router.get('/available', examController.getAvailableExams);
router.get('/:id', examController.getExamById);
router.post('/', examController.createExam);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

// Exam activation/deactivation
router.post('/:id/activate', examController.activateExam);
router.post('/:id/deactivate', examController.deactivateExam);

// Mock exam activation/deactivation
router.post('/:id/mock-activate', examController.activateMockExam);
router.post('/:id/mock-deactivate', examController.deactivateMockExam);

// Download candidates
router.post('/download-candidates', examController.downloadCandidates);

// Create dashboard for exam
router.post('/:id/create-dashboard', examController.createDashboard);

// Upload candidates with auto distribution
router.post('/:id/upload-candidates', upload.single('file'), examController.uploadCandidates);

module.exports = router;