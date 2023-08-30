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
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        name: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING,
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
    return await queryInterface.addConstraint("GenderAttentionLines", {
      name: "fk_GenderAttentionLines_CategoryId",
      fields: ["categoryId"],
      type: "foreign key",
      references: {
        table: "GenderCategories",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("GenderAttentionLines", "fk_GenderAttentionLines_CategoryId");
    await queryInterface.removeConstraint("GenderAttentionLines", "fk_GenderAttentionLines_CreatedBy");
    await queryInterface.dropTable("GenderAttentionLines");
  },
};
