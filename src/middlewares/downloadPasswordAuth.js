const downloadPasswordService = require('../services/downloadPasswordService');

// Middleware to verify download password
const verifyDownloadPassword = async (req, res, next) => {
  try {
    const { examId, password } = req.body;
    const operatorId = req.user.id; // Assuming user is attached by auth middleware
    
    if (!examId || !password) {
      return res.status(400).json({
        success: false,
        error: 'examId and password are required'
      });
    }
    
    // Verify password
    const result = await downloadPasswordService.verifyDownloadPassword(
      examId,
      password,
      operatorId
    );
    
    // Attach verification result to request
    req.passwordVerified = true;
    req.verificationDetails = result;
    
    next();
    
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: error.message || 'Password verification failed',
      code: 'PASSWORD_VERIFICATION_FAILED'
    });
  }
};

// Middleware to check if admin has generated password
const checkActivePassword = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const status = await downloadPasswordService.getPasswordStatus(examId);
    
    if (!status.activePassword) {
      return res.status(403).json({
        success: false,
        error: 'No active download password for this exam. Please generate one first.',
        code: 'NO_ACTIVE_PASSWORD'
      });
    }
    
    req.activePassword = status.activePassword;
    next();
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to check password status',
      code: 'PASSWORD_CHECK_FAILED'
    });
  }
};

module.exports = {
  verifyDownloadPassword,
  checkActivePassword
};