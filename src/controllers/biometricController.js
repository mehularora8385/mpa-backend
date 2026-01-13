
exports.reverify = async (req, res, next) => {
  try {
    const { verificationId, biometricData } = req.body;
    const result = await biometricService.reverify(verificationId, biometricData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
