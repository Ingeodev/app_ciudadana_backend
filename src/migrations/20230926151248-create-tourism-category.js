'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TourismCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(60)
      },
      color: {
        type: Sequelize.STRING(15)
      },
      icon: {
        type: Sequelize.STRING
      },
      iconMap: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    }, {

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TourismCategories');
  }
};