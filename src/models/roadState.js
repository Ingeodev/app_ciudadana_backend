const moment = require("moment-timezone");
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RoadState extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RoadState.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      RoadState.belongsTo(models.Alert, {
        foreignKey: {
          name: "alertId",
          allowNull: true,
          unique: false,
        },
      });
    }
  }
  RoadState.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      alertId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      type: {
        type: DataTypes.GEOMETRY,
        allowNull: false,
        unique: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
      startHour: {
        type: DataTypes.TIME,
        allowNull: false,
        unique: false,
      },
      endHour: {
        type: DataTypes.TIME,
        allowNull: false,
        unique: false,
      },
      iconMap: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      recurrence: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "RoadState",
      tableName: "RoadStates",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return RoadState;
};
