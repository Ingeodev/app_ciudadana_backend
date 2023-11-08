'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SecurityAttentionPoints", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(10),
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      imageUri: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      iconMap: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      geolocation: {
        type: Sequelize.GEOMETRY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SecurityAttentionPoints');
  }
};