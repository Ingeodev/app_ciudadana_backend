'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "PqrsResponses",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        pqrsId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
          references: {
            model: "Pqrs",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        userId: {
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
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        fileUri: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
      },
      {
        tableName: "PqrsResponses",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PqrsResponses");
  },
};