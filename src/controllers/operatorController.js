const operatorService = require("../services/operatorService");
const Operator = require("../models/Operator");
const Candidate = require("../models/Candidate");

exports.upload = async (req, res, next) => {
  try {
    const { file } = req;
    const result = await operatorService.bulkUpload(file);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSlotCandidates = async (req, res, next) => {
  try {
    const operatorId = req.user.id; // Assuming operator is authenticated
    const operator = await Operator.findOne({ where: { userId: operatorId } });

    if (!operator || !operator.slotId) {
      return res.status(404).json({ success: false, message: "Operator not found or not assigned to a slot." });
    }

    const candidates = await Candidate.findAll({ 
      where: { 
        examId: operator.examId,
        centreCode: operator.centreCode,
        slotId: operator.slotId 
      }
    });

    res.json({ success: true, candidates });

  } catch (error) {
    next(error);
  }
};
