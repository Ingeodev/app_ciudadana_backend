"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_taxicomplaints_type" AS ENUM('driver', 'vehicle');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_taxicomplaints_complainttype" AS ENUM('unauthorized_driver', 'vehicle_poor_condition', 'overcharge', 'inappropriate_behavior', 'excessive_speed');
    `);
    await queryInterface.createTable(
      "TaxiComplaints",
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
          references: {
            model: "Users",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        type: {
          type: "enum_taxicomplaints_type",
          allowNull: false,
          unique: false,
        },
        complaintType: {
          type: "enum_taxicomplaints_complainttype",
          allowNull: false,
          unique: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        identifier: {
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
        tableName: "TaxiComplaints",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_taxicomplaints_type";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_taxicomplaints_complainttype";
    `);
    await queryInterface.dropTable("TaxiComplaints");
  },
};
