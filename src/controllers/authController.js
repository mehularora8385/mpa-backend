
exports.changePassword = async (req, res, next) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


