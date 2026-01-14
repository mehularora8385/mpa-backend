const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Attendance = db.define('Attendance', {
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
  centreCode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  operatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  present: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  markedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  corrected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  correctedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  correctedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true
});

module.exports = Attendance;
