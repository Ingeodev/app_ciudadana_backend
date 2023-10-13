"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "RoadStates",
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
        title: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: false,
        },
        type: {
          type: Sequelize.GEOMETRY,
          allowNull: false,
          unique: false,
        },
        startDate: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        endDate: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        iconMap: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        recurrence: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        color: {
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
        tableName: "RoadStates",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("RoadStates");
  },
};
