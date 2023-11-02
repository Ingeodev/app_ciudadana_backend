"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TourismCompanies",
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
          allowNull: true,
          unique: false,
        },
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        imageUri: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        siteUri: {
          type: Sequelize.TEXT,
          allowNull: true,
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
        tableName: "TourismCompanies",
        schema: "public",
      }
    );
    // await queryInterface.sequelize.query(`
    //   CREATE UNIQUE INDEX "idx_unique_tourism_nit"
    //   ON "TourismCompanies"("nit")
    //   WHERE "deletedAt" IS NULL;
    // `);
    await queryInterface.addConstraint("TourismCompanies", {
      name: "fk_TourismCompanies_CreatedBy",
      fields: ["createdBy"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
    return await queryInterface.addConstraint("TourismCompanies", {
      name: "fk_TourismCompanies_CategoryId",
      fields: ["categoryId"],
      type: "foreign key",
      references: {
        table: "TourismCategories",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("TourismCompanies", "fk_TourismCompanies_CategoryId");
    await queryInterface.removeConstraint("TourismCompanies", "fk_TourismCompanies_CreatedBy");
    // await queryInterface.sequelize.query(`
    //   DROP INDEX IF EXISTS "idx_unique_tourism_nit";
    // `);
    await queryInterface.dropTable("TourismCompanies");
  },
};
