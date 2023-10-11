"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class SecurityCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SecurityCategory.hasMany(models.Report, {
        foreignKey: {
          name: "securityCategoryId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  SecurityCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      iconMap: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "SecurityCategory",
      tableName: "SecurityCategories",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        beforeUpdate: (obj, options) => {
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        afterCreate: (obj, options) => {
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterUpdate: (obj, options) => {
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.iconMap = transformSavedUriToSend(obj.iconMap);
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.iconMap = transformSavedUriToSend(result.iconMap);
          }
        },
      },
    }
  );
  return SecurityCategory;
};
