"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Cities",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: false,
        },
        cityCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        state: {
          type: Sequelize.STRING(100),
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
        tableName: "Cities",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_cityCode"
      ON "Cities"("cityCode")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_city_state"
      ON "Cities"("city", "state")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_city_state";
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_cityCode";
    `);
    await queryInterface.dropTable("Cities");
  },
};
