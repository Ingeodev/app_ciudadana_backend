"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "DocumentTypes",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        name: {
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
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "DocumentTypes",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_documentType_code"
      ON "DocumentTypes"("code")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_documentType_name"
      ON "DocumentTypes"("name")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_documentType_name";
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_documentType_code";
    `);
    await queryInterface.dropTable("DocumentTypes");
  },
};
