"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Reports",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.STRING(200),
        },
        securityCategoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        imageUri: {
          // ! Limite de tamanio del String?
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        lat: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        lon: {
          type: Sequelize.FLOAT,
          allowNull: true,
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
        tableName: "Reports",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("Reports", {
      name: "fk_Reports_SecurityCategories",
      fields: ["securityCategoryId"],
      type: "foreign key",
      references: {
        table: "SecurityCategories",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    return await queryInterface.addConstraint("Reports", {
      name: "fk_Reports_Users",
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Reports", "fk_Reports_Users");
    await queryInterface.removeConstraint("Reports", "fk_Reports_SecurityCategories");
    await queryInterface.dropTable("Reports");
  },
};
