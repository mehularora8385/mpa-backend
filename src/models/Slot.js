const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'LOCKED'),
    defaultValue: 'PENDING'
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'slots',
  timestamps: true
});

module.exports = Slot;
