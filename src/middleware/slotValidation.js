const Operator = require("../models/Operator");

async function slotValidation(req, res, next) {
  const operatorId = req.user.id; // Assuming operator is authenticated
  const { slotId } = req.body;

  if (!slotId) {
    return res.status(400).json({ success: false, message: "Slot ID is required." });
  }

  try {
    const operator = await Operator.findOne({ where: { userId: operatorId } });

    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found." });
    }

    if (operator.slotId !== slotId) {
      return res.status(403).json({ success: false, message: "Operator not assigned to this slot." });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = slotValidation;
