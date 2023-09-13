"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ThirdPartyServices",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        service: {
          type: Sequelize.STRING(50),
          allowNull: false,
          // unique: true,
        },
        companyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          // unique: false,
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
        tableName: "ThirdPartyServices",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_unique_thirdPartyCompanyId_service
      ON "ThirdPartyServices"("companyId", "service")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.addConstraint("ThirdPartyServices", {
      name: "fk_ThirdPartyServices_Company",
      fields: ["companyId"],
      type: "foreign key",
      references: {
        table: "ThirdPartyCompanies",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("ThirdPartyServices", "fk_ThirdPartyServices_Company");
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_unique_thirdPartyCompanyId_service;
    `);
    await queryInterface.dropTable("ThirdPartyServices");
  },
};
