const omrService = require('../services/omrService');
const multer = require('multer');

// Configure multer for OMR image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for OMR images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Scan OMR barcode
exports.scanOMR = async (req, res, next) => {
  try {
    const { examId, operatorId, barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({
        success: false,
        error: 'Barcode is required'
      });
    }
    
    if (!examId || !operatorId) {
      return res.status(400).json({
        success: false,
        error: 'examId and operatorId are required'
      });
    }
    
    // Upload OMR image to S3 if provided
    let omrImageUrl = null;
    if (req.file) {
      const { s3 } = require('../config/aws');
      const filename = `omr/${examId}/${Date.now()}_${req.file.originalname}`;
      
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ServerSideEncryption: 'AES256'
      };
      
      const uploadResult = await s3.upload(uploadParams).promise();
      omrImageUrl = uploadResult.Location;
    }
    
    const result = await omrService.scanOMR(barcode, examId, operatorId, omrImageUrl);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Validate OMR barcode against roll number
exports.validateOMR = async (req, res, next) => {
  try {
    const { barcode, rollNumber, examId } = req.body;
    
    if (!barcode || !rollNumber || !examId) {
      return res.status(400).json({
        success: false,
        error: 'barcode, rollNumber, and examId are required'
      });
    }
    
    const result = await omrService.validateOMR(barcode, rollNumber, examId);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Get OMR by barcode
exports.getOMRByBarcode = async (req, res, next) => {
  try {
    const { barcode, examId } = req.params;
    
    const omr = await omrService.getOMRByBarcode(barcode, examId);
    
    if (!omr) {
      return res.status(404).json({
        success: false,
        error: 'OMR not found'
      });
    }
    
    res.json({
      success: true,
      data: omr
    });
    
  } catch (error) {
    next(error);
  }
};

// List OMRs for exam
exports.listOMRs = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await omrService.listOMRs(examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete OMR (admin only)
exports.deleteOMR = async (req, res, next) => {
  try {
    const { barcode, examId } = req.params;
    const adminId = req.user.id;
    
    const result = await omrService.deleteOMR(barcode, examId, adminId);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Export upload middleware for use in routes
exports.upload = upload;