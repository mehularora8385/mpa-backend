const Slot = require('../models/Slot');
const OperatorSlot = require('../models/OperatorSlot');
const Candidate = require('../models/Candidate');
const { Op } = require('sequelize');

// Create new slot
const createSlot = async (slotData) => {
  try {
    const slot = await Slot.create({
      examId: slotData.examId,
      centreId: slotData.centreId,
      slotName: slotData.slotName,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      maxCandidates: slotData.maxCandidates,
      currentCount: 0,
      status: 'scheduled'
    });
    
    return {
      success: true,
      message: 'Slot created successfully',
      slot: slot
    };
    
  } catch (error) {
    console.error('Create slot error:', error);
    throw new Error(`Failed to create slot: ${error.message}`);
  }
};

// Assign operator to slot
const assignOperatorToSlot = async (operatorId, slotId, assignedBy) => {
  try {
    // Check if slot exists
    const slot = await Slot.findByPk(slotId);
    if (!slot) {
      throw new Error('Slot not found');
    }
    
    // Check if already assigned
    const existingAssignment = await OperatorSlot.findOne({
      where: { operatorId, slotId }
    });
    
    if (existingAssignment) {
      throw new Error('Operator already assigned to this slot');
    }
    
    // Create assignment
    const operatorSlot = await OperatorSlot.create({
      operatorId,
      slotId,
      assignedBy
    });
    
    return {
      success: true,
      message: 'Operator assigned to slot successfully',
      assignment: operatorSlot
    };
    
  } catch (error) {
    console.error('Assign operator to slot error:', error);
    throw new Error(`Failed to assign operator: ${error.message}`);
  }
};

// Get operator's assigned slots
const getOperatorSlots = async (operatorId, examId) => {
  try {
    const operatorSlots = await OperatorSlot.findAll({
      where: { operatorId },
      include: [
        {
          model: Slot,
          where: {
            examId: examId,
            status: 'active'
          }
        }
      ]
    });
    
    const slots = operatorSlots
      .filter(os => os.Slot) // Filter out null slots
      .map(os => os.Slot);
    
    return {
      success: true,
      slots: slots,
      slotIds: slots.map(s => s.id),
      count: slots.length
    };
    
  } catch (error) {
    console.error('Get operator slots error:', error);
    throw new Error(`Failed to get operator slots: ${error.message}`);
  }
};

// Filter candidates by slot
const filterCandidatesBySlot = async (operatorId, examId, additionalFilters = {}) => {
  try {
    // Get operator's assigned slots
    const { slots, slotIds } = await getOperatorSlots(operatorId, examId);
    
    if (slotIds.length === 0) {
      return {
        success: false,
        error: 'Operator not assigned to any active slots',
        candidates: []
      };
    }
    
    // Build query filters
    const filters = {
      examId: examId,
      slotId: { [Op.in]: slotIds },
      ...additionalFilters
    };
    
    // Query candidates
    const candidates = await Candidate.findAll({
      where: filters,
      include: [
        {
          model: Slot,
          attributes: ['id', 'slotName', 'startTime', 'endTime', 'status']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    return {
      success: true,
      candidates: candidates,
      count: candidates.length,
      assignedSlots: slots
    };
    
  } catch (error) {
    console.error('Filter candidates by slot error:', error);
    throw new Error(`Failed to filter candidates: ${error.message}`);
  }
};

// Update slot status
const updateSlotStatus = async (slotId, status) => {
  try {
    const slot = await Slot.findByPk(slotId);
    
    if (!slot) {
      throw new Error('Slot not found');
    }
    
    await slot.update({ status });
    
    return {
      success: true,
      message: `Slot status updated to ${status}`,
      slot: slot
    };
    
  } catch (error) {
    console.error('Update slot status error:', error);
    throw new Error(`Failed to update slot status: ${error.message}`);
  }
};

// Get all slots for exam
const getExamSlots = async (examId) => {
  try {
    const slots = await Slot.findAll({
      where: { examId },
      include: [
        {
          model: require('../models/Operator'),
          through: 'operator_slots',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['startTime', 'ASC']]
    });
    
    return {
      success: true,
      slots: slots,
      count: slots.length
    };
    
  } catch (error) {
    console.error('Get exam slots error:', error);
    throw new Error(`Failed to get exam slots: ${error.message}`);
  }
};

// Remove operator from slot
const removeOperatorFromSlot = async (operatorId, slotId) => {
  try {
    const assignment = await OperatorSlot.findOne({
      where: { operatorId, slotId }
    });
    
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    await assignment.destroy();
    
    return {
      success: true,
      message: 'Operator removed from slot successfully'
    };
    
  } catch (error) {
    console.error('Remove operator from slot error:', error);
    throw new Error(`Failed to remove operator: ${error.message}`);
  }
};

module.exports = {
  createSlot,
  assignOperatorToSlot,
  getOperatorSlots,
  filterCandidatesBySlot,
  updateSlotStatus,
  getExamSlots,
  removeOperatorFromSlot
};