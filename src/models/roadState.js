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
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        comment: "Usuario que creó el registro (clave foránea).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      alertId: {
        comment: "Clave foránea hacia Alerts.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      title: {
        comment: "Título del contenido.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      description: {
        comment: "Descripción del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      type: {
        comment: "Campo type (GEOMETRY).",
        type: DataTypes.GEOMETRY,
        allowNull: false,
        unique: false,
      },
      startDate: {
        comment: "Campo startDate (DATE).",
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
      endDate: {
        comment: "Campo endDate (DATE).",
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
      startHour: {
        comment: "Campo startHour (TIME).",
        type: DataTypes.TIME,
        allowNull: false,
        unique: false,
      },
      endHour: {
        comment: "Campo endHour (TIME).",
        type: DataTypes.TIME,
        allowNull: false,
        unique: false,
      },
      iconMap: {
        comment: "Campo iconMap (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      recurrence: {
        comment: "Campo recurrence (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      color: {
        comment: "Color representativo asociado al registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Estados de las vías reportados por los usuarios.",
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
