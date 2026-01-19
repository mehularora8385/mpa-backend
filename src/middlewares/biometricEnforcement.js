const Attendance = require('../models/Attendance');
const { Op } = require('sequelize');

// Middleware to enforce attendance before biometric
const enforceAttendanceFirst = async (req, res, next) => {
  try {
    const { candidateId, operatorId, examId } = req.body;
    
    if (!candidateId || !operatorId || !examId) {
      return res.status(400).json({
        success: false,
        error: 'candidateId, operatorId, and examId are required',
        code: 'MISSING_PARAMETERS'
      });
    }
    
    // Check if attendance is completed and biometric is eligible
    const attendance = await Attendance.findOne({
      where: {
        candidateId,
        examId,
        status: 'completed',
        biometricEligible: true
      }
    });
    
    if (!attendance) {
      return res.status(403).json({
        success: false,
        error: 'Attendance must be completed before biometric verification',
        code: 'ATTENDANCE_REQUIRED',
        details: {
          candidateId,
          examId,
          message: 'Please complete attendance first and ensure it is marked as eligible for biometric verification'
        }
      });
    }
    
    // Verify operator is the same who completed attendance
    if (attendance.operatorId !== operatorId) {
      return res.status(403).json({
        success: false,
        error: 'Biometric verification must be performed by the same operator who completed attendance',
        code: 'OPERATOR_MISMATCH',
        details: {
          attendanceOperatorId: attendance.operatorId,
          requestOperatorId: operatorId
        }
      });
    }
    
    // Attach attendance to request for use in controller
    req.attendance = attendance;
    req.enforcementPassed = true;
    
    next();
    
  } catch (error) {
    console.error('Biometric enforcement error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Biometric enforcement check failed',
      code: 'ENFORCEMENT_CHECK_FAILED'
    });
  }
};

// Middleware to mark attendance as completed and eligible for biometric
const markBiometricEligible = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    
    const attendance = await Attendance.findByPk(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance not found',
        code: 'ATTENDANCE_NOT_FOUND'
      });
    }
    
    if (attendance.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Attendance must be completed before marking as biometric eligible',
        code: 'ATTENDANCE_NOT_COMPLETED'
      });
    }
    
    // Mark as biometric eligible
    await attendance.update({
      checkpoint: true,
      biometricEligible: true
    });
    
    req.attendance = attendance;
    next();
    
  } catch (error) {
    console.error('Mark biometric eligible error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark attendance as biometric eligible',
      code: 'BIOMETRIC_ELIGIBLE_FAILED'
    });
  }
};

module.exports = {
  enforceAttendanceFirst,
  markBiometricEligible
};