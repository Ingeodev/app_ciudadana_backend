"use strict";
/** @type {import('sequelize-cli').Migration} */
const env = process.env.NODE_ENV || 'development';
const { UTC_ZONE_DB } = require("../config/utc_zone.json");

// Nombre de la base de datos. Se obtiene de la variable DB_NAME (viaja a
// Cloud Functions vía Secret Manager). Ya NO se usa config/config.json.
const dbName = process.env.DB_NAME;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER DATABASE ${dbName} SET TIMEZONE TO '${UTC_ZONE_DB}';`
    );
    await queryInterface.sequelize.query(`SET timezone='UTC';`);
    await queryInterface.sequelize.query(`SET TIME ZONE '${UTC_ZONE_DB}';`);
  },
  down: async (queryInterface, Sequelize) => {
  },
};
