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
          unique: true,
        },
        nit: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        thirdPartyCategoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        siteUri: {
          type: Sequelize.STRING,
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
          allowNull: true,
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
    return await queryInterface.addConstraint("ThirdPartyCompanies", {
      name: "fk_ThirdPartyCompanies_CategoryId",
      fields: ["thirdPartyCategoryId"],
      type: "foreign key",
      references: {
        table: "ThirdPartyCategories",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("ThirdPartyCompanies", "fk_ThirdPartyCompanies_CategoryId");
    await queryInterface.removeConstraint("ThirdPartyCompanies", "fk_ThirdPartyCompanies_CreatedBy");
    await queryInterface.dropTable("ThirdPartyCompanies");
  },
};
