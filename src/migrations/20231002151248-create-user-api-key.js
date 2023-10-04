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
        userId: {
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
        module: {
          type: Sequelize.ENUM("TOURISM", "TRANSPORTROUTES"),
          // defaultValue: "NULL",
        },
        key: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: true,
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
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_userApiKey"
      ON "UserApiKeys"("userId", "module")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_userApiKey";
    `);
    await queryInterface.dropTable("UserApiKeys");
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_UserApiKeys_module";
    `);
  }
};