const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fingerprint = sequelize.define('Fingerprint', {
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
  fingerprintImage: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'S3 URL of the fingerprint image'
  },
  captureTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  captureDeviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageQuality: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  storageLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'S3 path/key'
  },
  encrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'fingerprints',
  timestamps: true,
  indexes: [
    {
      fields: ['candidateId'],
      name: 'idx_fingerprints_candidate'
    },
    {
      fields: ['examId'],
      name: 'idx_fingerprints_exam'
    },
    {
      fields: ['operatorId'],
      name: 'idx_fingerprints_operator'
    },
    {
      unique: true,
      fields: ['candidateId', 'examId'],
      name: 'unique_fingerprint_per_candidate_exam'
    }
  ]
});

module.exports = Fingerprint;