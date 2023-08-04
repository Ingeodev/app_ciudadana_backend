'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Alerts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      sentBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      siteUri: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
      },
      isSMS: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      isPUSH: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      isAlertList: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
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
    },
      {
        tableName: "Alerts",
        schema: "public",
      });
    return await queryInterface.addConstraint("Alerts", {
      name: "fk_Alerts_Users",
      fields: ["sentBy"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Alerts");
  }
};
