"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Securities",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: false,
        },
        phone: {
          // ! Limite de tamanio del String?
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        imageUri: {
          // ! Limite de tamanio del String?
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        siteUri: {
          // ! Limite de tamanio del String?
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        address: {
          // ! Limite de tamanio del String?
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          unique: false,
        },
        createdAt: {
          type: "TIMESTAMP",
          allowNull: false,
        },
        updatedAt: {
          type: "TIMESTAMP",
          allowNull: true,
        },
        deletedAt: {
          type: "TIMESTAMP",
          allowNull: true,
        },
      },
      {
        tableName: "Securities",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Securities");
  },
};
