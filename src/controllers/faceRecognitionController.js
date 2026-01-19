const faceRecognitionService = require('../services/faceRecognitionService');
const multer = require('multer');

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create face collection
exports.createCollection = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await faceRecognitionService.createFaceCollection(examId);
    
    res.json({
      success: true,
      message: 'Face collection created successfully',
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Enroll candidate face
exports.enrollFace = async (req, res, next) => {
  try {
    const { examId, candidateId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Face image is required'
      });
    }
    
    if (!examId || !candidateId) {
      return res.status(400).json({
        success: false,
        error: 'examId and candidateId are required'
      });
    }
    
    const result = await faceRecognitionService.enrollFace(
      examId,
      candidateId,
      req.file.buffer,
      req.file.originalname
    );
    
    res.json({
      success: true,
      message: 'Face enrolled successfully',
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify face
exports.verifyFace = async (req, res, next) => {
  try {
    const { examId, candidateId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Live face image is required'
      });
    }
    
    if (!examId || !candidateId) {
      return res.status(400).json({
        success: false,
        error: 'examId and candidateId are required'
      });
    }
    
    const result = await faceRecognitionService.verifyFace(
      examId,
      candidateId,
      req.file.buffer
    );
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete face
exports.deleteFace = async (req, res, next) => {
  try {
    const { examId, candidateId } = req.params;
    
    const result = await faceRecognitionService.deleteFace(examId, candidateId);
    
    res.json({
      success: true,
      message: 'Face deleted successfully',
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// List faces in collection
exports.listFaces = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await faceRecognitionService.listFaces(examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Export upload middleware for use in routes
exports.upload = upload;