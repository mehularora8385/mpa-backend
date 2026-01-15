const { DataTypes } = require('sequelize');
const db = require('../config/database');

const LivePassword = db.define('LivePassword', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'live_passwords',
  timestamps: true
});

module.exports = LivePassword;
