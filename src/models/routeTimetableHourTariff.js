"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RouteTimetableHourTariff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RouteTimetableHourTariff.belongsTo(models.RouteTimetable, {
        foreignKey: {
          name: "timetableId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  RouteTimetableHourTariff.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      timetableId: {
        comment: "Clave foránea hacia RouteTimetables.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      hour: {
        comment: "Campo hour (TIME).",
        type: DataTypes.TIME,
        allowNull: false,
        unique: false,
      },
      tariff: {
        comment: "Campo tariff (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Tarifas aplicables por hora dentro de un horario de ruta.",
      sequelize,
      modelName: "RouteTimetableHourTariff",
      tableName: "RouteTimetableHourTariffs",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_hour_timetableId",
          unique: true,
          fields: ["hour", "timetableId"],
        }
      ],
    }
  );
  return RouteTimetableHourTariff;
};
