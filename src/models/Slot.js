const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  centreId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  slotName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxCandidates: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'completed'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'slots',
  timestamps: true,
  indexes: [
    {
      fields: ['examId'],
      name: 'idx_slots_exam'
    },
    {
      fields: ['centreId'],
      name: 'idx_slots_centre'
    },
    {
      fields: ['status'],
      name: 'idx_slots_status'
    }
  ]
});

module.exports = Slot;