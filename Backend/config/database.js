// config/database.js
const { Sequelize } = require("sequelize");
const path = require("path");

// Absolute path to your SQLite DB file
const sequelize = new Sequelize({
  dialect: "table_eminent_speaker",
  //   storage: path.resolve(__dirname, "../icdmai.db"), // adjust path if needed
  logging: false, // optional: disable SQL logging
});

module.exports = sequelize;
