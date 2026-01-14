const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Operator = db.define('Operator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  operatorId: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
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
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  lastCheckIn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastCheckOut: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'operators',
  timestamps: true
});

module.exports = Operator;
