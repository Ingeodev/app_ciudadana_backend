'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.addConstraint('Advertisements', {
      name: 'fk_Advertisements_AdvertisementCategories',
      fields: ['categoryId'],
      type: 'foreign key',
      references: {
        table: 'AdvertisementCategories',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeConstraint('Advertisements', 'fk_Advertisements_AdvertisementCategories');
  }
};
