const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const DownloadPassword = require('../models/DownloadPassword');
const { Op } = require('sequelize');

// Generate secure random password
const generatePassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const password = crypto.randomBytes(length).toString('base64').slice(0, length);
  // Replace any characters not in charset
  return password.split('').map(char => 
    charset.includes(char) ? char : charset[Math.floor(Math.random() * charset.length)]
  ).join('');
};

// Create download password for exam
const createDownloadPassword = async (examId, adminId, expiryMinutes = 30) => {
  const plainPassword = generatePassword(parseInt(process.env.PASSWORD_LENGTH) || 12);
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  
  // Invalidate any existing unused passwords for this exam
  await DownloadPassword.update(
    { isUsed: true, notes: 'Superseded by new password' },
    {
      where: {
        examId,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    }
  );
  
  // Create new password record
  const downloadPassword = await DownloadPassword.create({
    examId,
    passwordHash,
    expiresAt,
    createdBy: adminId
  });
  
  return {
    success: true,
    passwordId: downloadPassword.id,
    password: plainPassword, // Return plain password only once
    expiresAt: downloadPassword.expiresAt,
    expiryMinutes
  };
};

// Verify download password
const verifyDownloadPassword = async (examId, password, operatorId) => {
  // Find active password for exam
  const downloadPassword = await DownloadPassword.findOne({
    where: {
      examId,
      isUsed: false,
      expiresAt: { [Op.gt]: new Date() }
    },
    order: [['createdAt', 'DESC']]
  });
  
  if (!downloadPassword) {
    throw new Error('No active download password found or password has expired');
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, downloadPassword.passwordHash);
  
  if (!isPasswordValid) {
    throw new Error('Invalid download password');
  }
  
  // Mark password as used
  await downloadPassword.update({
    isUsed: true,
    usedBy: operatorId,
    usedAt: new Date()
  });
  
  return {
    success: true,
    passwordId: downloadPassword.id,
    verifiedAt: new Date()
  };
};

// Get password status (for admin monitoring)
const getPasswordStatus = async (examId) => {
  const activePassword = await DownloadPassword.findOne({
    where: {
      examId,
      isUsed: false,
      expiresAt: { [Op.gt]: new Date() }
    },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: require('../models/User'),
        as: 'creator',
        attributes: ['id', 'username', 'email']
      }
    ]
  });
  
  if (!activePassword) {
    return {
      success: true,
      activePassword: null,
      message: 'No active password for this exam'
    };
  }
  
  return {
    success: true,
    activePassword: {
      id: activePassword.id,
      createdAt: activePassword.createdAt,
      expiresAt: activePassword.expiresAt,
      isUsed: activePassword.isUsed,
      createdBy: activePassword.creator
    },
    remainingTime: Math.max(0, activePassword.expiresAt - new Date())
  };
};

// Regenerate password (admin action)
const regeneratePassword = async (examId, adminId, expiryMinutes = 30) => {
  return await createDownloadPassword(examId, adminId, expiryMinutes);
};

module.exports = {
  createDownloadPassword,
  verifyDownloadPassword,
  getPasswordStatus,
  regeneratePassword
};