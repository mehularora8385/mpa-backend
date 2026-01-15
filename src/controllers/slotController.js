const Slot = require('../models/Slot');

// Get all slots for an exam
exports.getSlotsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const slots = await Slot.findAll({ where: { examId } });
    res.json({ success: true, slots });
  } catch (error) {
    next(error);
  }
};

// Create a new slot
exports.createSlot = async (req, res, next) => {
  try {
    const { examId, name, startTime, endTime } = req.body;
    const slot = await Slot.create({ examId, name, startTime, endTime });
    res.status(201).json({ success: true, message: "Slot created successfully", slot });
  } catch (error) {
    next(error);
  }
};
