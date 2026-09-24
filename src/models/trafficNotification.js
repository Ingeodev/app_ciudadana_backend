"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrafficNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TrafficNotification.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TrafficNotification.init(
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
      recurrence: {
        comment: "Campo recurrence (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      dataNumber: {
        comment: "Campo dataNumber (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel1: {
        comment: "Campo colorLevel1 ([object Object]).",
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
      limit1and2: {
        comment: "Campo limit1and2 (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel2: {
        comment: "Campo colorLevel2 ([object Object]).",
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
      limit2and3: {
        comment: "Campo limit2and3 (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel3: {
        comment: "Campo colorLevel3 ([object Object]).",
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
      limit3and4: {
        comment: "Campo limit3and4 (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel4: {
        comment: "Campo colorLevel4 ([object Object]).",
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Notificaciones sobre el estado del tráfico en las vías.",
      sequelize,
      modelName: "TrafficNotification",
      tableName: "TrafficNotifications",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return TrafficNotification;
};
