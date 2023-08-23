"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ThirdPartyCompany extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ThirdPartyCompany.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      ThirdPartyCompany.belongsTo(models.ThirdPartyCategory, {
        foreignKey: {
          name: "thirdPartyCategoryId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  ThirdPartyCompany.init(
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
      thirdPartyCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
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
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: "ThirdPartyCompany",
      tableName: "ThirdPartyCompanies",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return ThirdPartyCompany;
};
