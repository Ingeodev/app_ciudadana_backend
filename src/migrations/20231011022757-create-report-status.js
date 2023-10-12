"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ReportStatuses",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        reportId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
          references: {
            model: "Reports",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        status: {
          type: Sequelize.ENUM("APPROVED", "DISAPPROVED", "PENDING"),
          defaultValue: "PENDING",
          allowNull: false,
          unique: false,
          // APPROVED: The report has been approved
          // DISAPPROVED: The report has been disapproved
          // PENDING: The report has been approved/disapproved, and you have a period of time to approve/disapproved it.
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
      },
      {
        tableName: "ReportStatuses",
        schema: "public",
      }
    );
    // return await queryInterface.sequelize.query(`
    //   CREATE UNIQUE INDEX "idx_unique_reportStatues"
    //   ON "ReportStatuses"("reportId", "status")
    //   WHERE "deletedAt" IS NULL;
    // `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_ReportStatuses_status";
    `);
    // await queryInterface.sequelize.query(`
    //   DROP INDEX IF EXISTS "idx_unique_reportStatues";
    // `);
    await queryInterface.dropTable("ReportStatuses");
  },
};
