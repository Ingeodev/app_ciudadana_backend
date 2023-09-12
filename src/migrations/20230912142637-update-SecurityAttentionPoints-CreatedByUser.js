'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('SecurityAttentionPoints', 'createdBy', {
        type: Sequelize.INTEGER,
      }, {
        transaction,
      });
      await queryInterface.sequelize.query("UPDATE \"SecurityAttentionPoints\" SET \"createdBy\" = 4", {
        transaction
      });
      await queryInterface.changeColumn('SecurityAttentionPoints', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, {
        transaction
      });
      await queryInterface.addConstraint('SecurityAttentionPoints', {
        name: 'fk_SecurityAttentionPoints_User',
        fields: ['createdBy'],
        type: 'foreign key',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'restrict',
        onUpdate: 'restrict',
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint('SecurityAttentionPoints', 'fk_SecurityAttentionPoints_User', { transaction });
      await queryInterface.removeColumn('SecurityAttentionPoints', 'createdBy', { transaction });
    });
  }
};
