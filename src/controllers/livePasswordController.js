const crypto = require('crypto');
const LivePassword = require('../models/LivePassword');

// Generate a new live password
exports.generatePassword = async (req, res, next) => {
  try {
    const generatedBy = req.user.id; // Assuming user is authenticated
    const password = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    const livePassword = await LivePassword.create({
      password,
      generatedBy,
      expiresAt
    });

    res.status(201).json({ 
      success: true, 
      message: "Live password generated successfully",
      password: livePassword.password, 
      expiresAt: livePassword.expiresAt 
    });
  } catch (error) {
    next(error);
  }
};

// Validate a live password
exports.validatePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const livePassword = await LivePassword.findOne({ where: { password } });

    if (!livePassword) {
      return res.status(401).json({ success: false, message: 'Invalid live password' });
    }

    if (livePassword.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Live password has expired' });
    }

    res.json({ success: true, message: 'Live password validated successfully' });
  } catch (error) {
    next(error);
  }
};
