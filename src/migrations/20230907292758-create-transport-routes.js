"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TransportRoutes",
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
        },
        origin: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        destination: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        companyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        duration: {
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
        tableName: "TransportRoutes",
        schema: "public",
      }
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_origin_destination_companyId"
      ON "TransportRoutes"("origin", "destination", "companyId")
      WHERE "deletedAt" IS NULL;
    `);
    await queryInterface.addConstraint("TransportRoutes", {
      name: "fk_TransportRoutes_Company",
      fields: ["companyId"],
      type: "foreign key",
      references: {
        table: "TransportCompanies",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    await queryInterface.addConstraint("TransportRoutes", {
      name: "fk_TransportRoutes_Origin",
      fields: ["origin"],
      type: "foreign key",
      references: {
        table: "Cities",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    await queryInterface.addConstraint("TransportRoutes", {
      name: "fk_TransportRoutes_Destination",
      fields: ["destination"],
      type: "foreign key",
      references: {
        table: "Cities",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    return await queryInterface.addConstraint("TransportRoutes", {
      name: "fk_TransportRoute_CreatedBy",
      fields: ["createdBy"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("TransportRoutes", "fk_TransportRoute_CreatedBy");
    await queryInterface.removeConstraint("TransportRoutes", "fk_TransportRoutes_Destination");
    await queryInterface.removeConstraint("TransportRoutes", "fk_TransportRoutes_Origin");
    await queryInterface.removeConstraint("TransportRoutes", "fk_TransportRoutes_Company");
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_origin_destination_companyId";
    `);
    await queryInterface.dropTable("TransportRoutes");
  },
};
