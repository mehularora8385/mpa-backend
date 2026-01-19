const slotService = require('../services/slotService');

// Middleware to filter data by operator's assigned slot
const filterBySlot = async (req, res, next) => {
  try {
    const operatorId = req.user.id; // Assuming user is attached by auth middleware
    const examId = req.params.examId || req.body.examId;
    
    if (!examId) {
      return res.status(400).json({
        success: false,
        error: 'examId is required',
        code: 'MISSING_EXAM_ID'
      });
    }
    
    // Get operator's assigned slots
    const { slots, slotIds } = await slotService.getOperatorSlots(operatorId, examId);
    
    if (slotIds.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Operator not assigned to any active slots',
        code: 'NO_SLOT_ASSIGNED',
        details: {
          operatorId,
          examId,
          message: 'Please contact administrator to get assigned to a slot'
        }
      });
    }
    
    // Attach slot filter to request
    req.slotFilter = { slotId: { [Op.in]: slotIds } };
    req.operatorSlots = slots;
    req.operatorSlotIds = slotIds;
    
    next();
    
  } catch (error) {
    console.error('Slot filter error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Slot filtering failed',
      code: 'SLOT_FILTER_FAILED'
    });
  }
};

// Middleware to check if operator is assigned to specific slot
const checkSlotAssignment = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const slotId = req.params.slotId || req.body.slotId;
    
    if (!slotId) {
      return res.status(400).json({
        success: false,
        error: 'slotId is required',
        code: 'MISSING_SLOT_ID'
      });
    }
    
    const Slot = require('../models/Slot');
    const OperatorSlot = require('../models/OperatorSlot');
    
    // Check if operator is assigned to this slot
    const assignment = await OperatorSlot.findOne({
      where: {
        operatorId,
        slotId
      },
      include: [
        {
          model: Slot
        }
      ]
    });
    
    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: 'Operator not assigned to this slot',
        code: 'SLOT_ASSIGNMENT_NOT_FOUND',
        details: {
          operatorId,
          slotId
        }
      });
    }
    
    // Check if slot is active
    if (assignment.Slot.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Slot is not active',
        code: 'SLOT_NOT_ACTIVE',
        details: {
          slotId,
          slotStatus: assignment.Slot.status
        }
      });
    }
    
    req.slotAssignment = assignment;
    next();
    
  } catch (error) {
    console.error('Check slot assignment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Slot assignment check failed',
      code: 'SLOT_ASSIGNMENT_CHECK_FAILED'
    });
  }
};

module.exports = {
  filterBySlot,
  checkSlotAssignment
};