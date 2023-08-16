"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ThirdPartyCategories",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        icon: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        iconMap: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        siteUri: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        color: {
          type: Sequelize.STRING(10),
          allowNull: true,
          unique: false,
        },
        createdAt: {
          type: "TIMESTAMP",
          allowNull: false,
          // type: Sequelize.DATE
        },
        updatedAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // type: Sequelize.DATE
        },
        deletedAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // type: Sequelize.DATE
        },
      },
      {
        tableName: "ThirdPartyCategories",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ThirdPartyCategories");
  },
};
