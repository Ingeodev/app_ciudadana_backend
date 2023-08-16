'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('AdvertisementCategories', 'updatedAt', {
        type: Sequelize.DATE,
      }, {
        transaction,
      });
      await queryInterface.sequelize.query("UPDATE public.\"AdvertisementCategories\" SET \"updatedAt\" = CURRENT_TIMESTAMP", {
        transaction
      });
      await queryInterface.changeColumn('AdvertisementCategories', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
      }, {
        transaction
      });
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('AdvertisementCategories', 'updatedAt');
  }
};
