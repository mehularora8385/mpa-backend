const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("testdb", "testuser", "testpass", {
  host: "localhost",
  dialect: "postgres",
  logging: false
});

module.exports = sequelize;
