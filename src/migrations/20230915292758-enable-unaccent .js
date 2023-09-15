"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // To enable PostGIS
    await queryInterface.sequelize.query(
      "CREATE EXTENSION IF NOT EXISTS unaccent;"
    );
  },

  down: async (queryInterface, Sequelize) => {
    // To disable PostGIS in case you want to reverse migration
    await queryInterface.sequelize.query("DROP EXTENSION IF EXISTS unaccent;");
  },
};
