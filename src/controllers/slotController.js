const slotService = require('../services/slotService');

// Create new slot
exports.createSlot = async (req, res, next) => {
  try {
    const result = await slotService.createSlot(req.body);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.slot
    });
    
  } catch (error) {
    next(error);
  }
};

// Assign operator to slot
exports.assignOperator = async (req, res, next) => {
  try {
    const { operatorId, slotId } = req.body;
    const assignedBy = req.user.id;
    
    const result = await slotService.assignOperatorToSlot(operatorId, slotId, assignedBy);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.assignment
    });
    
  } catch (error) {
    next(error);
  }
};

// Get operator's assigned slots
exports.getOperatorSlots = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { examId } = req.params;
    
    const result = await slotService.getOperatorSlots(operatorId, examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Filter candidates by slot
exports.filterCandidates = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { examId } = req.params;
    
    // Get additional filters from query
    const additionalFilters = {};
    if (req.query.status) {
      additionalFilters.status = req.query.status;
    }
    if (req.query.present) {
      additionalFilters.present = req.query.present === 'true';
    }
    
    const result = await slotService.filterCandidatesBySlot(
      operatorId,
      examId,
      additionalFilters
    );
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Update slot status
exports.updateStatus = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;
    
    const result = await slotService.updateSlotStatus(slotId, status);
    
    res.json({
      success: true,
      message: result.message,
      data: result.slot
    });
    
  } catch (error) {
    next(error);
  }
};

// Get all slots for exam
exports.getExamSlots = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await slotService.getExamSlots(examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Remove operator from slot
exports.removeOperator = async (req, res, next) => {
  try {
    const { operatorId, slotId } = req.body;
    
    const result = await slotService.removeOperatorFromSlot(operatorId, slotId);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};