"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "RouteTimetables",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          unique: false,
        },
        startTime: {
          type: Sequelize.ARRAY(Sequelize.TIME),
          allowNull: false,
          unique: false,
        },
        routeId: {
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
        tableName: "RouteTimetables",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_unique_date_routeId
      ON "RouteTimetables"("date", "routeId")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.addConstraint("RouteTimetables", {
      name: "fk_RouteTimetables_Route",
      fields: ["routeId"],
      type: "foreign key",
      references: {
        table: "TransportRoutes",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("RouteTimetables", "fk_RouteTimetables_Route");
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_unique_date_routeId;
    `);
    await queryInterface.dropTable("RouteTimetables");
  },
};
