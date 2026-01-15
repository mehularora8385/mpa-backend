const Biometric = require("../models/Biometric");

exports.syncBiometrics = async (req, res, next) => {
  try {
    const { biometricData } = req.body; // Expecting an array of biometric records

    if (!Array.isArray(biometricData) || biometricData.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or empty biometric data." });
    }

    const syncTimestamp = new Date();
    let successfulSyncs = 0;
    let failedSyncs = 0;
    const errors = [];

    for (const record of biometricData) {
      try {
        await Biometric.upsert({ ...record, syncTimestamp });
        successfulSyncs++;
      } catch (error) {
        failedSyncs++;
        errors.push({ record, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Sync completed.",
      successfulSyncs,
      failedSyncs,
      errors
    });

  } catch (error) {
    next(error);
  }
};
