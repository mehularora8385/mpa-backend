const backupService = require("../services/backupService");

exports.trigger = async (req, res, next) => {
  try {
    const result = await backupService.trigger();
    res.json(result);
  } catch (error) {
    next(error);
  }
};
