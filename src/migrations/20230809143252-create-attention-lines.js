'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AttentionLines", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      whatsapp: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        // ! allowNull: true?
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        // ! allowNull: true?
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        // ! allowNull: true?
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AttentionLines");
  }
};