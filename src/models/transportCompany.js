"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransportCompany extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TransportCompany.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TransportCompany.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      nit: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      siteUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
        unique: false,
      },
      lon: {
        type: DataTypes.FLOAT,
        allowNull: false,
        unique: false,
      },
      geolocation: {
        type: DataTypes.GEOMETRY,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "TransportCompany",
      tableName: "TransportCompanies",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return TransportCompany;
};
