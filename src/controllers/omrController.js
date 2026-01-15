const OMR = require("../models/OMR");
const Candidate = require("../models/Candidate");

// Bind a scanned OMR barcode to a candidate's roll number
exports.scanOMR = async (req, res, next) => {
  try {
    const { rollNo, scannedBarcode } = req.body;

    // Find the candidate by roll number
    const candidate = await Candidate.findOne({ where: { rollNo } });
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    // Find the expected OMR barcode for this candidate
    const omr = await OMR.findOne({ where: { candidateId: candidate.id } });
    if (!omr) {
      return res.status(404).json({ success: false, message: "Expected OMR barcode not found for this candidate." });
    }

    // Validate the scanned barcode
    const isValid = omr.expectedBarcode === scannedBarcode;

    // Update the OMR record
    await omr.update({
      scannedBarcode,
      isValidated: isValid,
      scanTimestamp: new Date()
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "OMR barcode does not match." });
    }

    res.json({ success: true, message: "OMR barcode validated successfully." });
  } catch (error) {
    next(error);
  }
};

// Get the OMR validation status for a candidate
exports.getOMRStatus = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const omr = await OMR.findOne({ where: { candidateId } });

    if (!omr) {
      return res.status(404).json({ success: false, message: "OMR record not found for this candidate." });
    }

    res.json({ success: true, omr });
  } catch (error) {
    next(error);
  }
};
