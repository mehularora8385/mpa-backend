const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Biometric = db.define('Biometric', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  operatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  faceImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fingerprintTemplate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  omrSerialNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  matchPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'failed'),
    defaultValue: 'pending'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reverified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reverifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'biometrics',
  timestamps: true
});

module.exports = Biometric;
