const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Biometric = sequelize.define('Biometric', {
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
  verificationType: {
    type: DataTypes.ENUM('face', 'fingerprint', 'both'),
    defaultValue: 'face'
  },
  faceMatchPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Actual face match score from AWS Rekognition'
  },
  matchThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 96.5,
    comment: 'Required threshold for face verification'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  faceImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'S3 URL of captured face image'
  },
  enrolledFaceImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'S3 URL of enrolled face image'
  },
  faceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'AWS Rekognition face ID'
  },
  verificationTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional verification metadata'
  }
}, {
  tableName: 'biometrics',
  timestamps: true,
  indexes: [
    {
      fields: ['candidateId'],
      name: 'idx_biometrics_candidate'
    },
    {
      fields: ['operatorId'],
      name: 'idx_biometrics_operator'
    },
    {
      fields: ['examId'],
      name: 'idx_biometrics_exam'
    },
    {
      fields: ['isVerified'],
      name: 'idx_biometrics_verified'
    },
    {
      fields: ['verificationType'],
      name: 'idx_biometrics_type'
    },
    {
      unique: true,
      fields: ['candidateId', 'examId'],
      name: 'unique_biometric_per_candidate_exam'
    }
  ]
});

module.exports = Biometric;