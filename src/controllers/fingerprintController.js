const fingerprintService = require('../services/fingerprintService');
const multer = require('multer');

// Configure multer for fingerprint image uploads
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

// Capture fingerprint
exports.captureFingerprint = async (req, res, next) => {
  try {
    const { candidateId, examId, operatorId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Fingerprint image is required'
      });
    }
    
    if (!candidateId || !examId || !operatorId) {
      return res.status(400).json({
        success: false,
        error: 'candidateId, examId, and operatorId are required'
      });
    }
    
    // Validate image quality
    const qualityCheck = await fingerprintService.validateFingerprintQuality(req.file.buffer);
    
    if (!qualityCheck.valid) {
      return res.status(400).json({
        success: false,
        error: qualityCheck.message,
        details: qualityCheck.checks
      });
    }
    
    const result = await fingerprintService.captureFingerprint(
      candidateId,
      examId,
      operatorId,
      req.file.buffer,
      {
        captureDeviceId: req.body.captureDeviceId,
        imageQuality: req.body.imageQuality,
        ...req.body.metadata
      }
    );
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Get fingerprint status
exports.getFingerprintStatus = async (req, res, next) => {
  try {
    const { candidateId, examId } = req.params;
    
    const result = await fingerprintService.getFingerprintStatus(candidateId, examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete fingerprint (admin only)
exports.deleteFingerprint = async (req, res, next) => {
  try {
    const { fingerprintId } = req.params;
    const adminId = req.user.id;
    
    const result = await fingerprintService.deleteFingerprint(fingerprintId, adminId);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// List fingerprints for exam (admin only)
exports.listFingerprints = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await fingerprintService.listFingerprints(examId);
    
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