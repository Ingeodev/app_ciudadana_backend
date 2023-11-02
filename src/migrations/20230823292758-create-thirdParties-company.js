"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ThirdPartyCompanies",
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
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        siteUri: {
          type: Sequelize.TEXT,
          allowNull: true,
          unique: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        imageUri: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        lat: {
          type: Sequelize.FLOAT,
          allowNull: false,
          unique: false,
        },
        lon: {
          type: Sequelize.FLOAT,
          allowNull: false,
          unique: false,
        },
        geolocation: {
          type: Sequelize.GEOMETRY,
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
        tableName: "ThirdPartyCompanies",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("ThirdPartyCompanies", {
      name: "fk_ThirdPartyCompanies_CreatedBy",
      fields: ["createdBy"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    await queryInterface.addConstraint("ThirdPartyCompanies", {
      name: "fk_ThirdPartyCompanies_CategoryId",
      fields: ["categoryId"],
      type: "foreign key",
      references: {
        table: "ThirdPartyCategories",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_thirdPartyCompanies_name"
      ON "ThirdPartyCompanies"("name")
      WHERE "deletedAt" IS NULL;
    `);
    return await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "idx_unique_thirdPartyCompanies_nit"
      ON "ThirdPartyCompanies"("nit")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_thirdPartyCompanies_nit";
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_thirdPartyCompanies_name";
    `);
    await queryInterface.removeConstraint("ThirdPartyCompanies", "fk_ThirdPartyCompanies_CategoryId");
    await queryInterface.removeConstraint("ThirdPartyCompanies", "fk_ThirdPartyCompanies_CreatedBy");
    await queryInterface.dropTable("ThirdPartyCompanies");
  },
};
