"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        roleId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: false,
        },
        clientId: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(50),
        },
        lastName: {
          type: Sequelize.STRING(50),
        },
        email: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: true,
        },
        documentTypeId: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        document: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        address: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        serviceReceiptUri: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        loginPhase: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        disabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          unique: false,
        },
        userMobile: {
          type: Sequelize.BOOLEAN,
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
        tableName: "Users",
        schema: "public",
      }
    );
    // await queryInterface.addConstraint("Users", {
    //   name: "fk_Users_DocumentTypes",
    //   fields: ["documentTypeId"],
    //   type: "foreign key",
    //   references: {
    //     table: "DocumentTypes",
    //     field: "id",
    //   },
    //   onDelete: "RESTRICT",
    //   onUpdate: "cascade",
    // });
    return await queryInterface.addConstraint("Users", {
      name: "fk_users_roles",
      fields: ["roleId"],
      type: "foreign key",
      references: {
        table: "Roles",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Users", "fk_users_roles");
    // await queryInterface.removeConstraint("Users", "fk_Users_DocumentTypes");
    await queryInterface.dropTable("Users");
  },
};
