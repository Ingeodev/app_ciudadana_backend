"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class Security extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Security.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        comment: "Nombre del registro.",
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
      imageUri: {
        comment: "URL de la imagen asociada.",
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
      active: {
        comment: "Campo active (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Reportes y novedades de seguridad reportados por los ciudadanos.",
      sequelize,
      modelName: "Security",
      tableName: "Securities",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_securities",
          unique: true,
          fields: ["name"],
        },
      ],
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
  return Security;
};
