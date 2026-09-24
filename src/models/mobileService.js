"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class MobileService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MobileService.hasMany(models.Advertisement, {
        foreignKey: {
          name: "categoryId",
          allowNull: true,
        },
      });
    }
  }
  MobileService.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      route: {
        comment: "Campo route (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      name: {
        comment: "Nombre del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      subtitle: {
        comment: "Campo subtitle (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        comment: "URL de la imagen asociada.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      icon: {
        comment: "Campo icon (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      accessLevel: {
        comment: "Campo accessLevel (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      active: {
        comment: "Campo active (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: true,
      },
    },
    {
      comment: "Servicios móviles registrados y disponibles en la aplicación.",
      sequelize,
      modelName: "MobileService",
      tableName: "MobileServices",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
          obj.icon = transformReceivedUriToSave(obj.icon);
        },
        beforeUpdate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
          obj.icon = transformReceivedUriToSave(obj.icon);
        },
        afterCreate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
          obj.icon = transformSavedUriToSend(obj.icon);
        },
        afterUpdate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
          obj.icon = transformSavedUriToSend(obj.icon);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.icon = transformSavedUriToSend(obj.icon);
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
            result.dataValues.icon = transformSavedUriToSend(result.icon);
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
  return MobileService;
};
