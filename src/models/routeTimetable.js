"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RouteTimetable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RouteTimetable.belongsTo(models.TransportRoute, {
        foreignKey: {
          name: "routeId",
          allowNull: false,
          unique: false,
        },
      });
      RouteTimetable.hasMany(models.RouteTimetableHourTariff, {
        foreignKey: {
          name: "timetableId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  RouteTimetable.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
      routeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "RouteTimetable",
      tableName: "RouteTimetables",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_date_routeId",
          unique: true,
          fields: ["date", "routeId"],
        }
      ],
    }
  );
  return RouteTimetable;
};
