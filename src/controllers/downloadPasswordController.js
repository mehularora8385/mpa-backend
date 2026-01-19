const downloadPasswordService = require('../services/downloadPasswordService');

// Generate download password
exports.generatePassword = async (req, res, next) => {
  try {
    const { examId, expiryMinutes } = req.body;
    const adminId = req.user.id;
    
    if (!examId) {
      return res.status(400).json({
        success: false,
        error: 'examId is required'
      });
    }
    
    const result = await downloadPasswordService.createDownloadPassword(
      examId,
      adminId,
      expiryMinutes
    );
    
    res.json({
      success: true,
      message: 'Download password generated successfully',
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify download password
exports.verifyPassword = async (req, res, next) => {
  try {
    const { examId, password } = req.body;
    const operatorId = req.user.id;
    
    if (!examId || !password) {
      return res.status(400).json({
        success: false,
        error: 'examId and password are required'
      });
    }
    
    const result = await downloadPasswordService.verifyDownloadPassword(
      examId,
      password,
      operatorId
    );
    
    res.json({
      success: true,
      message: 'Password verified successfully',
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Get password status
exports.getPasswordStatus = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await downloadPasswordService.getPasswordStatus(examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Regenerate password
exports.regeneratePassword = async (req, res, next) => {
  try {
    const { examId, expiryMinutes } = req.body;
    const adminId = req.user.id;
    
    if (!examId) {
      return res.status(400).json({
        success: false,
        error: 'examId is required'
      });
    }
    
    const result = await downloadPasswordService.regeneratePassword(
      examId,
      adminId,
      expiryMinutes
    );
    
    res.json({
      success: true,
      message: 'Password regenerated successfully',
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};