const centreService = require("../services/centreService");

exports.checkCapacity = async (req, res, next) => {
  try {
    const { centreId } = req.params;
    const result = await centreService.checkCapacity(centreId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
