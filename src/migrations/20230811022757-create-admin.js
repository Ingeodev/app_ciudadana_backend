"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Admins",
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
          // ! Verificar si Firebase en ocasiones email=null
          allowNull: false,
          unique: true,
        },
        documentTypeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        numberDocument: {
          type: Sequelize.STRING(50),
          allowNull: false,
          // ! unique: true? Diversidad de tipos de documentos
          unique: true,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        imageUri: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        siteUri: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        disabled: {
          type: Sequelize.BOOLEAN,
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
        tableName: "Admins",
        schema: "public",
      }
    );
    return await queryInterface.addConstraint("Admins", {
      name: "fk_Admins_DocumentTypes",
      fields: ["documentTypeId"],
      type: "foreign key",
      references: {
        table: "DocumentTypes",
        field: "id",
      },
      onDelete: "RESTRICT",
      // onDelete: "cascade",
      onUpdate: "cascade",
    });
    // return await queryInterface.addConstraint("Admins", {
    //   name: "fk_Admins_Role",
    //   fields: ["roleId"],
    //   type: "foreign key",
    //   references: {
    //     table: "Roles",
    //     field: "id",
    //   },
    //   onDelete: "RESTRICT",
    //   // onDelete: "cascade",
    //   onUpdate: "cascade",
    // });
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint("Admins", "fk_Admins_Role");
    await queryInterface.removeConstraint("Admins", "fk_Admins_DocumentTypes");
    return queryInterface.dropTable("Admins");
  },
};
