'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      "SocialNetworkTypes",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        name: {
          type: Sequelize.STRING(50),
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
        tableName: "SocialNetworkTypes",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_socialNetworkTypes_code"
      ON "SocialNetworkTypes"("code")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_socialNetworkTypes_name"
      ON "SocialNetworkTypes"("name")
      WHERE "deletedAt" IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_socialNetworkTypes_name";
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_socialNetworkTypes_code";
    `);
    await queryInterface.dropTable("SocialNetworkTypes");
  }
};
