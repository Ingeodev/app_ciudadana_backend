'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "PqrsStatuses",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        pqrsId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
          references: {
            model: "Pqrs",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        status: {
          type: Sequelize.ENUM("ENVIADA", "RECIBIDA", "ATENDIDA"),
          defaultValue: "ENVIADA",
          allowNull: false,
          unique: false,
          // ENVIADA: La solicitud fue creada por el ciudadano.
          // RECIBIDA: La solicitud fue recibida por la entidad.
          // ATENDIDA: La solicitud fue atendida por la entidad.
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
        tableName: "PqrsStatuses",
        schema: "public",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_PqrsStatuses_status";
    `);
    await queryInterface.dropTable("PqrsStatuses");
  },
};