"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TourismServices",
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
          unique: false,
        },
        companyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
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
        tableName: "TourismServices",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_tourismServices_service"
      ON "TourismServices"("companyId", "service")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.addConstraint("TourismServices", {
      name: "fk_tourismServices_Company",
      fields: ["companyId"],
      type: "foreign key",
      references: {
        table: "TourismCompanies",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("TourismServices", "fk_tourismServices_Company");
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_tourismServices_service";
    `);
    await queryInterface.dropTable("TourismServices");
  },
};
