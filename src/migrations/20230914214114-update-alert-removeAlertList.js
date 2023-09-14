'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Alerts', 'isAlertList');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('Alerts', 'isAlertList', {
        type: Sequelize.BOOLEAN,
      }, {
        transaction,
      });
      await queryInterface.sequelize.query("UPDATE \"Alerts\" SET \"isAlertList\" = FALSE", {
        transaction
      });
      await queryInterface.changeColumn('Alerts', 'isAlertList', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }, {
        transaction
      });
    });
  }
};
