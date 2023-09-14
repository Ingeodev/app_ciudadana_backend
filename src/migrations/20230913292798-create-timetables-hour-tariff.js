"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "RouteTimetableHourTariffs",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        timetableId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        hour: {
          type: Sequelize.TIME,
          allowNull: false,
          unique: false,
        },
        tariff: {
          type: Sequelize.INTEGER,
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
        tableName: "RouteTimetableHourTariffs",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_unique_hour_timetableId
      ON "RouteTimetableHourTariffs"("hour", "timetableId")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.addConstraint("RouteTimetableHourTariffs", {
      name: "fk_RouteTimetables_timetableId",
      fields: ["timetableId"],
      type: "foreign key",
      references: {
        table: "RouteTimetables",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("RouteTimetableHourTariffs", "fk_RouteTimetables_timetableId");
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_unique_hour_timetableId;
    `);
    await queryInterface.dropTable("RouteTimetableHourTariffs");
  },
};
