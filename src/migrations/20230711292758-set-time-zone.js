"use strict";
/** @type {import('sequelize-cli').Migration} */
const env = process.env.NODE_ENV || 'development';
const config = require("../config/config.json")[env];
const { UTC_ZONE_DB } = require("../config/utc_zone.json");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER DATABASE ${config.database} SET TIMEZONE TO '${UTC_ZONE_DB}';`
    );
    await queryInterface.sequelize.query(`SET timezone='UTC';`);
    await queryInterface.sequelize.query(`SET TIME ZONE '${UTC_ZONE_DB}';`);
  },
  down: async (queryInterface, Sequelize) => {
  },
};
