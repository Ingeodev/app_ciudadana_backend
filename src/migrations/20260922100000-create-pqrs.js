'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Pqrs",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        radicado: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        typeSol: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        firstName: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        secondName: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        firstLastName: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        secondLastName: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: false,
        },
        documentTypeId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: false,
        },
        doc: {
          type: Sequelize.STRING(20),
          allowNull: true,
          unique: false,
        },
        nit: {
          type: Sequelize.STRING(20),
          allowNull: true,
          unique: false,
        },
        corporation: {
          type: Sequelize.STRING(150),
          allowNull: true,
          unique: false,
        },
        direction: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: false,
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: false,
        },
        cel: {
          type: Sequelize.STRING(15),
          allowNull: false,
          unique: false,
        },
        phone: {
          type: Sequelize.STRING(15),
          allowNull: false,
          unique: false,
        },
        country: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        province: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        city: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        requestTypeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        dependencyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        responseChannel: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        fileUri: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          unique: false,
        },
      },
      {
        tableName: "Pqrs",
        schema: "public",
      }
    );

    await queryInterface.addConstraint("Pqrs", {
      name: "fk_Pqrs_Dependencies",
      fields: ["dependencyId"],
      type: "foreign key",
      references: {
        table: "Dependencies",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("Pqrs", {
      name: "fk_Pqrs_DocumentTypes",
      fields: ["documentTypeId"],
      type: "foreign key",
      references: {
        table: "DocumentTypes",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    return await queryInterface.addConstraint("Pqrs", {
      name: "fk_Pqrs_Users",
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Pqrs", "fk_Pqrs_Users");
    await queryInterface.removeConstraint("Pqrs", "fk_Pqrs_DocumentTypes");
    await queryInterface.removeConstraint("Pqrs", "fk_Pqrs_Dependencies");
    await queryInterface.dropTable("Pqrs");
  },
};