const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SyncStatus = sequelize.define('SyncStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  operatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  entityType: {
    type: DataTypes.ENUM('attendance', 'biometric', 'fingerprint'),
    allowNull: false
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'synced', 'conflict', 'failed'),
    defaultValue: 'pending'
  },
  syncTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  conflictDetected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  conflictReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sync_statuses',
  timestamps: true,
  indexes: [
    {
      fields: ['operatorId'],
      name: 'idx_sync_status_operator'
    },
    {
      fields: ['examId'],
      name: 'idx_sync_status_exam'
    },
    {
      fields: ['syncStatus'],
      name: 'idx_sync_status_status'
    },
    {
      fields: ['conflictDetected'],
      name: 'idx_sync_status_conflict'
    },
    {
      unique: true,
      fields: ['entityType', 'entityId'],
      name: 'unique_sync_entity'
    }
  ]
});

module.exports = SyncStatus;