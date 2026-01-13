const operatorService = require("../services/operatorService");

exports.upload = async (req, res, next) => {
  try {
    const { file } = req;
    const result = await operatorService.bulkUpload(file);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
