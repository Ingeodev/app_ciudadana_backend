'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "UserApiKeys",
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
          references: {
            model: "Users",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        tourismCompanyId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: false,
          references: {
            model: "TourismCompanies",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        transportCompanyId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: false,
          references: {
            model: "TransportCompanies",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        key: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        expirationAt: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "UserApiKeys",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_userApiKey"
      ON "UserApiKeys"("createdBy", "tourismCompanyId", "transportCompanyId")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_userApiKey_key"
      ON "UserApiKeys"("key")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_userApiKey_key";
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_userApiKey";
    `);
    await queryInterface.dropTable("UserApiKeys");
  }
};