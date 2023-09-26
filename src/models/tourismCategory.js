'use strict';
const { Model } = require('sequelize');

const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");

module.exports = (sequelize, DataTypes) => {
  class TourismCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TourismCategory.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TourismCategory.init({
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: DataTypes.STRING(60),
    color: DataTypes.STRING(15),
    icon: DataTypes.STRING,
    iconMap: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TourismCategory',
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
  });
  return TourismCategory;
};