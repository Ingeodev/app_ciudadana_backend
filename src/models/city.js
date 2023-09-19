"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      City.hasMany(models.TransportRoute, {
        as: "originName",
        foreignKey: {
          name: "origin",
          allowNull: false,
          unique: false,
        },
        targetKey: "cityCode",
      });
      City.hasMany(models.TransportRoute, {
        as: "destinationName",
        foreignKey: {
          name: "destination",
          allowNull: false,
          unique: false,
        },
        targetKey: "cityCode",
      });
    }
  }
  City.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      cityCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "City",
      tableName: "Cities",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return City;
};
