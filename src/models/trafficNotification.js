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
      recurrence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      dataNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel1: {
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
      limit1and2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel2: {
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
      limit2and3: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel3: {
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
      limit3and4: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      colorLevel4: {
        type: DataTypes,
        allowNull: false,
        unique: false,
      },
    },
    {
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
