const authService = require('../services/authService');

exports.forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
};
