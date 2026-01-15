const { Op } = require("sequelize");
const Slot = require("../models/Slot");

// Activate a shift and lock others
exports.startShift = async (req, res, next) => {
  try {
    const { examId, shiftId } = req.params;

    // Deactivate all other shifts for this exam
    await Slot.update({ status: 'LOCKED' }, { where: { examId, id: { [Op.ne]: shiftId } } });

    // Activate the target shift
    const [updated] = await Slot.update({ status: 'ACTIVE' }, { where: { id: shiftId, examId } });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Shift not found." });
    }

    res.json({ success: true, message: `Shift ${shiftId} is now ACTIVE.` });
  } catch (error) {
    next(error);
  }
};

// End a shift and allow the next one to be activated
exports.endShift = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const [updated] = await Slot.update({ status: 'COMPLETED' }, { where: { id: shiftId, status: 'ACTIVE' } });

    if (!updated) {
      return res.status(400).json({ success: false, message: "Shift is not active or not found." });
    }

    res.json({ success: true, message: `Shift ${shiftId} has been COMPLETED.` });
  } catch (error) {
    next(error);
  }
};

// Get the status of all shifts for a given exam
exports.getShiftStatus = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const shifts = await Slot.findAll({ where: { examId }, order: [['startTime', 'ASC']] });
    res.json({ success: true, shifts });
  } catch (error) {
    next(error);
  }
};
