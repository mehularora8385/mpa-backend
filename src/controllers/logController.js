const logService = require("../services/logService");

exports.getLogs = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const result = await logService.getLogs(filter);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
