"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "GenderAttentionLines",
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
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(15),
          allowNull: false,
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
        tableName: "GenderAttentionLines",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("GenderAttentionLines", {
      name: "fk_GenderAttentionLines_CreatedBy",
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
      CREATE UNIQUE INDEX "idx_unique_genderAttentionLines_name"
      ON "GenderAttentionLines"("name")
      WHERE "deletedAt" IS NULL;
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_unique_genderAttentionLines_name";
    `);
    await queryInterface.removeConstraint("GenderAttentionLines", "fk_GenderAttentionLines_CreatedBy");
    await queryInterface.dropTable("GenderAttentionLines");
  },
};
