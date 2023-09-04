'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      "MobileServices",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        route: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        subtitle: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        imageUri: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: false,
        },
        icon: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: false,
        },
        accessLevel: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          unique: false,
          defaultValue: true,
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
        tableName: "MobileServices",
        schema: "public",
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("MobileServices");
  }
};
