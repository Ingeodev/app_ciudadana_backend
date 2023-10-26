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
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      timetableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      hour: {
        type: DataTypes.TIME,
        allowNull: false,
        unique: false,
      },
      tariff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
    },
    {
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
