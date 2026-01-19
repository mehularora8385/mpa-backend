const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperatorSlot = sequelize.define('OperatorSlot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  operatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  slotId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'operator_slots',
  timestamps: true,
  indexes: [
    {
      fields: ['operatorId'],
      name: 'idx_operator_slots_operator'
    },
    {
      fields: ['slotId'],
      name: 'idx_operator_slots_slot'
    },
    {
      unique: true,
      fields: ['operatorId', 'slotId'],
      name: 'unique_operator_slot_assignment'
    }
  ]
});

module.exports = OperatorSlot;