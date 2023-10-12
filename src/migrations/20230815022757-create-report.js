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
        description: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: false,
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
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        lat: {
          type: Sequelize.FLOAT,
          allowNull: false,
          unique: false,
        },
        lon: {
          type: Sequelize.FLOAT,
          allowNull: false,
          unique: false,
        },
        expiresAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
        isApproved: {
          type: Sequelize.ENUM("yes", "no"),
          allowNull: true,
          unique: false,
          // yes: The report has been approved.
          // no: The report has been disapproved.
          // null: The report has not been approved or disapproved.
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
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Reports_isApproved";
    `);
    await queryInterface.removeConstraint("Reports", "fk_Reports_Users");
    await queryInterface.removeConstraint("Reports", "fk_Reports_SecurityCategories");
    await queryInterface.dropTable("Reports");
  },
};
