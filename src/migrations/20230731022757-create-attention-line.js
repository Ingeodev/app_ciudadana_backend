"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "AttentionLines",
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
        url: {
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
          // ! allowNull: true?
        },
        updatedAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // ! allowNull: true?
        },
        deleteAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // ! allowNull: true?
        },
      },
      {
        tableName: "AttentionLines",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AttentionLines");
  },
};
