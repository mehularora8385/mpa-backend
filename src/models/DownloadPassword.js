const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DownloadPassword = sequelize.define('DownloadPassword', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'download_passwords',
  timestamps: true,
  indexes: [
    {
      fields: ['examId', 'isUsed'],
      name: 'idx_download_passwords_exam_used'
    },
    {
      fields: ['expiresAt'],
      name: 'idx_download_passwords_expires'
    }
  ]
});

module.exports = DownloadPassword;