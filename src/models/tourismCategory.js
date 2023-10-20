'use strict';
const { Model } = require('sequelize');

const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");

module.exports = (sequelize, DataTypes) => {
  class TourismCategory extends Model {
    static associate(models) {
      // define association here
      TourismCategory.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      TourismCategory.hasMany(models.TourismCompany, {
        foreignKey: {
          name: "categoryId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TourismCategory.init(
    {
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: false,
      },
      color: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      iconMap: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "TourismCategory",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.icon = transformReceivedUriToSave(obj.icon);
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        beforeUpdate: (obj, options) => {
          obj.icon = transformReceivedUriToSave(obj.icon);
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        afterCreate: (obj, options) => {
          obj.icon = transformSavedUriToSend(obj.icon);
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterUpdate: (obj, options) => {
          obj.icon = transformSavedUriToSend(obj.icon);
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.icon = transformSavedUriToSend(obj.icon);
              obj.dataValues.iconMap = transformSavedUriToSend(obj.iconMap);
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.icon = transformSavedUriToSend(result.icon);
            result.dataValues.iconMap = transformSavedUriToSend(result.iconMap);
          }
        },
      },
    }
  );
  return TourismCategory;
};