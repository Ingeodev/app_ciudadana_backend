'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('AdvertisementCategories', 'color', {
      type: Sequelize.STRING(10),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('AdvertisementCategories', 'color');
  }
};
