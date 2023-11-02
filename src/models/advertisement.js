'use strict';
const { Model} = require('sequelize');
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class Advertisement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Advertisement.belongsTo(models.MobileService, {
        foreignKey: {
          name: "categoryId",
          allowNull: true,
        },
      });
    }
  }
  Advertisement.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      imageUri: DataTypes.STRING,
      imageMobileUri: DataTypes.STRING,
      siteUri: DataTypes.TEXT,
      categoryId: DataTypes.INTEGER,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Advertisement",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
          obj.imageMobileUri = transformReceivedUriToSave(obj.imageMobileUri);
        },
        beforeUpdate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
          obj.imageMobileUri = transformReceivedUriToSave(obj.imageMobileUri);
        },
        afterCreate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
          obj.imageMobileUri = transformSavedUriToSend(obj.imageMobileUri);
        },
        afterUpdate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
          obj.imageMobileUri = transformSavedUriToSend(obj.imageMobileUri);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.imageUri = transformSavedUriToSend(obj.imageUri);
              obj.dataValues.imageMobileUri = transformSavedUriToSend(
                obj.imageMobileUri
              );
              if (obj.image || obj.dataValues.image) {
                obj.dataValues.image = transformSavedUriToSend(
                  obj.dataValues.image
                );
                delete obj.dataValues.imageUri;
              }
              if (obj.imageMobile || obj.dataValues.imageMobile) {
                obj.dataValues.image = transformSavedUriToSend(
                  obj.dataValues.imageMobile
                );
                delete obj.dataValues.imageMobileUri;
              }
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.imageUri = transformSavedUriToSend(
              result.imageUri
            );
            result.dataValues.imageMobileUri = transformSavedUriToSend(
              result.imageMobileUri
            );
            if (result.image || result.dataValues.image) {
              result.dataValues.image = transformSavedUriToSend(
                result.dataValues.image
              );
              delete result.dataValues.imageUri;
            }
            if (result.imageMobile || result.dataValues.imageMobile) {
              result.dataValues.imageMobile = transformSavedUriToSend(
                result.dataValues.imageMobile
              );
              delete result.dataValues.imageMobileUri;
            }
          }
        },
      },
    }
  );
  return Advertisement;
};