const Biometric = require("../models/Biometric");
const Attendance = require("../models/Attendance");
const Candidate = require("../models/Candidate");
const faceMatchService = require("../services/faceMatchService");

const FACE_MATCH_THRESHOLD = 80.0;

exports.captureBiometric = async (req, res, next) => {
  try {
    const { candidateId, examId, operatorId, faceImage, fingerprintTemplate } = req.body;

    const attendance = await Attendance.findOne({ where: { candidateId, examId, present: true } });
    if (!attendance) {
      return res.status(403).json({ success: false, message: "Attendance not marked. Biometric capture is not allowed." });
    }

    const biometric = await Biometric.create({
      candidateId,
      examId,
      operatorId,
      faceImage,
      fingerprintTemplate,
      status: 'pending'
    });

    res.status(201).json({ 
      success: true, 
      message: "Biometric data captured successfully. Ready for verification.",
      biometricId: biometric.id
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyBiometric = async (req, res, next) => {
  try {
    const { biometricId } = req.params;
    const biometric = await Biometric.findByPk(biometricId);

    if (!biometric) {
      return res.status(404).json({ success: false, message: "Biometric record not found." });
    }

    const candidate = await Candidate.findByPk(biometric.candidateId);
    if (!candidate || !candidate.photoUrl) {
      return res.status(400).json({ success: false, message: "Candidate reference photo not found." });
    }

    const result = await faceMatchService.compareFaces(biometric.faceImage, candidate.photoUrl);

    biometric.matchPercentage = result.matchPercentage;
    biometric.verified = result.matchPercentage >= FACE_MATCH_THRESHOLD;
    biometric.status = biometric.verified ? 'verified' : 'failed';
    biometric.verifiedAt = new Date();
    await biometric.save();

    res.json({ 
      success: true, 
      message: `Verification complete. Match: ${result.matchPercentage}%`,
      verified: biometric.verified,
      matchPercentage: biometric.matchPercentage
    });

  } catch (error) {
    next(error);
  }
};

exports.reverify = async (req, res, next) => {
  try {
    const { verificationId, biometricData } = req.body;
    const result = await biometricService.reverify(verificationId, biometricData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
