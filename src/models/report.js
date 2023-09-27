"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.SecurityCategory, {
        foreignKey: {
          name: "securityCategoryId",
          allowNull: true,
        },
      });

      Report.belongsTo(models.User, {
        foreignKey: {
          name: "userId",
          allowNull: true,
        },
      });
    }
  }
  Report.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      securityCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lon: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Report",
      tableName: "Reports",
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
              if (obj.image || obj.dataValues.image) {
                obj.dataValues.image = transformSavedUriToSend(
                  obj.dataValues.image
                );
                delete obj.dataValues.imageUri;
              }
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.imageUri = transformSavedUriToSend(
              result.imageUri
            );
            if (result.image || result.dataValues.image) {
              result.dataValues.image = transformSavedUriToSend(
                result.dataValues.image
              );
              delete result.dataValues.imageUri;
            }
          }
        },
      },
    }
  );
  return Report;
};
