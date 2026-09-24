"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class GenderAttentionPoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GenderAttentionPoint.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  GenderAttentionPoint.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        comment: "Usuario que creó el registro (clave foránea).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      name: {
        comment: "Nombre del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      description: {
        comment: "Descripción del registro.",
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
      phone: {
        comment: "Teléfono de contacto.",
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      color: {
        comment: "Color representativo asociado al registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      address: {
        comment: "Dirección de contacto.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      geolocation: {
        comment: "Punto geográfico (GEOMETRY) con la ubicación.",
        type: DataTypes.GEOMETRY,
        allowNull: false,
        unique: false,
      },
      iconMap: {
        comment: "Campo iconMap (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Puntos de atención presencial especializados en la ruta de género.",
      sequelize,
      modelName: "GenderAttentionPoint",
      tableName: "GenderAttentionPoints",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        beforeUpdate: (obj, options) => {
          obj.imageUri = transformReceivedUriToSave(obj.imageUri);
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        afterCreate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterUpdate: (obj, options) => {
          obj.imageUri = transformSavedUriToSend(obj.imageUri);
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.iconMap = transformSavedUriToSend(obj.iconMap);
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
            result.dataValues.iconMap = transformSavedUriToSend(result.iconMap);
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
  return GenderAttentionPoint;
};
