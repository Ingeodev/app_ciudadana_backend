"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "SecurityCategories",
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
          unique: false,
        },
        iconMap: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        color: {
          type: Sequelize.STRING(10),
          allowNull: false,
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
        tableName: "SecurityCategories",
        schema: "public",
      }
    );
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_securityCategory_name"
      ON "SecurityCategories"("name")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_securityCategory_name";
    `);
    await queryInterface.dropTable("SecurityCategories");
  },
};
