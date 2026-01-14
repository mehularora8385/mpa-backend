const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Candidate = db.define('Candidate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  omrNo: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  rollNo: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fatherName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  centreCode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  slotId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fingerprintData: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  faceMatchPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  present: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'not_verified'),
    defaultValue: 'pending'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'candidates',
  timestamps: true
});

module.exports = Candidate;
