const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  operatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  centreId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'skipped'),
    defaultValue: 'pending'
  },
  checkpoint: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Attendance checkpoint for biometric enforcement'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  biometricEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flag to indicate if biometric verification is allowed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    {
      fields: ['candidateId'],
      name: 'idx_attendances_candidate'
    },
    {
      fields: ['operatorId'],
      name: 'idx_attendances_operator'
    },
    {
      fields: ['examId'],
      name: 'idx_attendances_exam'
    },
    {
      fields: ['status'],
      name: 'idx_attendances_status'
    },
    {
      fields: ['biometricEligible'],
      name: 'idx_attendances_biometric_eligible'
    },
    {
      unique: true,
      fields: ['candidateId', 'examId'],
      name: 'unique_attendance_per_candidate_exam'
    }
  ]
});

module.exports = Attendance;