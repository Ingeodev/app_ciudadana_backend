'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Advertisements', 'active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Advertisements', 'active', {
      type: Sequelize.BOOLEAN,
    });
  }
};
