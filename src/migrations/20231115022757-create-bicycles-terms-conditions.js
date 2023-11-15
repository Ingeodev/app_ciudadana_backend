"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "BicyclesTermsConditions",
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
        termsConditions: {
          type: Sequelize.TEXT,
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
        tableName: "BicyclesTermsConditions",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("BicyclesTermsConditions");
  },
};
