const express = require('express');
const router = express.Router();
const faceRecognitionController = require('../controllers/faceRecognitionController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create face collection for exam
router.post('/collection/:examId', faceRecognitionController.createCollection);

// Enroll candidate face
router.post('/enroll', 
  faceRecognitionController.upload.single('faceImage'),
  faceRecognitionController.enrollFace
);

// Verify face
router.post('/verify',
  faceRecognitionController.upload.single('liveFaceImage'),
  faceRecognitionController.verifyFace
);

// Delete face (admin only)
router.delete('/:examId/:candidateId', faceRecognitionController.deleteFace);

// List faces in collection (admin only)
router.get('/list/:examId', faceRecognitionController.listFaces);

module.exports = router;