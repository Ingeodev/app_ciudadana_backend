"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "GenderCategories",
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
        imageUri: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        siteUri: {
          type: Sequelize.STRING,
          allowNull: true,
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
        tableName: "GenderCategories",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("GenderCategories", {
      name: "fk_GenderCategories_CreatedBy",
      fields: ["createdBy"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_genderCategories_title"
      ON "GenderCategories"("title")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_genderCategories_title";
    `);
    await queryInterface.removeConstraint("GenderCategories", "fk_GenderCategories_CreatedBy");
    await queryInterface.dropTable("GenderCategories");
  },
};
