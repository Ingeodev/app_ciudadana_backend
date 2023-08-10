'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AdminNotifications", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tableName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("UNREAD", "READ", "ARCHIVED"),
        defaultValue: "UNREAD",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AdminNotifications");
  }
};