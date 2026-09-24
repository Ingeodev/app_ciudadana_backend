"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class Alert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Alert.belongsTo(models.User, {
        foreignKey: {
          name: "sentBy",
          allowNull: false,
        },
      });

      Alert.hasMany(models.RoadState, {
        foreignKey: {
          name: "alertId",
          allowNull: true,
          unique: false,
        },
      });
    }
  }
  Alert.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      sentBy: {
        comment: "Clave foránea hacia Users.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      title: {
        comment: "Título del contenido.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      message: {
        comment: "Mensaje o contenido textual.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      siteUri: {
        comment: "URL del sitio o recurso web asociado.",
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
      },
      imageUri: {
        comment: "URL de la imagen asociada.",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      isSMS: {
        comment: "Campo isSMS (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      isPUSH: {
        comment: "Campo isPUSH (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      expiresAt: {
        comment: "Campo expiresAt (TIMESTAMP WITH TIME ZONE).",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      comment: "Alertas de emergencia emitidas hacia los usuarios, con mensaje, imágenes y envío por SMS/push.",
      sequelize,
      modelName: "Alert",
      tableName: "Alerts",
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
  return Alert;
};
