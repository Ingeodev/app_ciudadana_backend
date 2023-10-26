'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Roles",
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
        description: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: false,
        },
        permission: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
      },
      {
        tableName: "Roles",
        schema: "public",
      }
    );
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_roles_name"
      ON "Roles"("name")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_roles_name";
    `);
    await queryInterface.dropTable('Roles');
  }
};