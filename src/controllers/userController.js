const userService = require("../services/userService");

exports.updateProfile = async (req, res, next) => {
  try {
    const { userId, profileData } = req.body;
    const result = await userService.updateProfile(userId, profileData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { userId, newRole } = req.body;
    const result = await userService.updateRole(userId, newRole);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
