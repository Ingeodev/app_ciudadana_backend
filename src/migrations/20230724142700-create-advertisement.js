'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Advertisements", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      imageUri: {
        type: Sequelize.STRING,
      },
      imageMobileUri: {
        type: Sequelize.STRING,
      },
      siteUri: {
        type: Sequelize.TEXT,
      },
      categoryId: {
        type: Sequelize.INTEGER,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
    return await queryInterface.addConstraint("Advertisements", {
      name: "fk_Advertisements_MobileServices",
      fields: ["categoryId"],
      type: "foreign key",
      references: {
        table: "MobileServices",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Advertisements", "fk_Advertisements_MobileServices");
    await queryInterface.dropTable("Advertisements");
  }
};