"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        clientId: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(50),
        },
        lastName: {
          type: Sequelize.STRING(50),
        },
        email: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        documentType: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        numberDocument: {
          type: Sequelize.STRING(50),
          allowNull: true,
          // ! unique: true? Diversidad de tipos de documentos
          unique: true,
        },
        birthDate: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        residenceAddress: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        serviceReceipt: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        loginPhase: {
          type: Sequelize.STRING(50),
        },
        createdAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // ! allowNull: true?
          // type: Sequelize.DATE
        },
        updatedAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // ! allowNull: true?
          // type: Sequelize.DATE
        },
      },
      {
        tableName: "Users",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
