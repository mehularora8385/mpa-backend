const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OMR = sequelize.define("OMR", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  expectedBarcode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scannedBarcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isValidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scanTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "omr_scans",
  timestamps: true
});

module.exports = OMR;
