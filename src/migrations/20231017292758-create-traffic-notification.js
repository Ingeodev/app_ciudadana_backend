"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TrafficNotifications",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
          references: {
            model: "Users",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        recurrence: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        dataNumber: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        colorLevel1: {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: false,
        },
        limit1and2: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        colorLevel2: {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: false,
        },
        limit2and3: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        colorLevel3: {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: false,
        },
        limit3and4: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        colorLevel4: {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
      },
      {
        tableName: "TrafficNotifications",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TrafficNotifications");
  },
};
