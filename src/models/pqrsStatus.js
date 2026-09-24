"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PqrsStatus extends Model {
    static associate(models) {
      PqrsStatus.belongsTo(models.Pqrs, {
        as: "Pqrs",
        foreignKey: {
          name: "pqrsId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  PqrsStatus.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      pqrsId: {
        comment: "Clave foránea hacia Pqrs.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      status: {
        comment: "Estado del registro.",
        type: DataTypes.ENUM("ENVIADA", "RECIBIDA", "ATENDIDA"),
        defaultValue: "ENVIADA",
        allowNull: false,
        unique: false,
        // ENVIADA: La solicitud fue creada por el ciudadano.
        // RECIBIDA: La solicitud fue recibida por la entidad.
        // ATENDIDA: La solicitud fue atendida por la entidad.
      },
    },
    {
      comment: "Estados del ciclo de vida de una PQRS.",
      sequelize,
      modelName: "PqrsStatus",
      tableName: "PqrsStatuses",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return PqrsStatus;
};