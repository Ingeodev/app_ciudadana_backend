"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
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
      TransportCompany.hasMany(models.TransportRoute, {
        foreignKey: {
          name: "companyId",
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
      imageUri: {
        type: DataTypes.STRING,
        allowNull: true,
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
      hooks: {
        beforeCreate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
        },
        beforeUpdate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
        },
        afterCreate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
        },
        afterUpdate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.imageUri = transformSavedUriToSend(obj.imageUri);
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.imageUri = transformSavedUriToSend(
              result.imageUri
            );
          }
        },
      },
    }
  );
  return TransportCompany;
};
