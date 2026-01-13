
exports.correct = async (req, res, next) => {
  try {
    const { attendanceId, correctionData } = req.body;
    const result = await attendanceService.correct(attendanceId, correctionData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
