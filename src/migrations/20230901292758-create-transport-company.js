"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TransportCompanies",
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
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        nit: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(15),
          allowNull: false,
          unique: false,
        },
        siteUri: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        imageUri: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
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
        tableName: "TransportCompanies",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("TransportCompanies", {
      name: "fk_TransportCompanies_CreatedBy",
      fields: ["createdBy"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_transportCompany"
      ON "TransportCompanies"("name", "nit")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_transportCompany";
    `);
    await queryInterface.removeConstraint("TransportCompanies", "fk_TransportCompanies_CreatedBy");
    await queryInterface.dropTable("TransportCompanies");
  },
};
