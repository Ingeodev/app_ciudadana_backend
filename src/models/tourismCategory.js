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
        comment: "Usuario que creó el registro (clave foránea).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      name: {
        comment: "Nombre del registro.",
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: false,
      },
      color: {
        comment: "Color representativo asociado al registro.",
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      icon: {
        comment: "Campo icon (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      iconMap: {
        comment: "Campo iconMap (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      comment: "Categorías dentro de la ruta de atención de turismo.",
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