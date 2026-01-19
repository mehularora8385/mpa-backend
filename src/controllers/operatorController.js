const operatorService = require("../services/operatorService");

exports.upload = async (req, res, next) => {
  try {
    const { file } = req;
    const result = await operatorService.bulkUpload(file);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Bulk upload operators (for CSV upload)
exports.bulkUpload = async (req, res, next) => {
  try {
    const { file } = req;
    const result = await operatorService.bulkUpload(file);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Logout all operators (for admin panel logout all button)
exports.logoutAll = async (req, res, next) => {
  try {
    // This would typically invalidate all operator tokens or send logout command via WebSocket
    // For now, we'll return a success response
    // The actual logout mechanism would be implemented with real-time communication
    
    const result = await operatorService.logoutAllOperators();
    
    res.json({
      success: true,
      message: 'All operators logged out successfully',
      data: {
        loggedOutAt: new Date(),
        operatorsCount: result.operatorsCount || 0
      }
    });
    
  } catch (error) {
    next(error);
  }
};
