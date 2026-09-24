"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class PqrsResponse extends Model {
    static associate(models) {
      PqrsResponse.belongsTo(models.Pqrs, {
        as: "Pqrs",
        foreignKey: {
          name: "pqrsId",
          allowNull: false,
          unique: false,
        },
      });

      PqrsResponse.belongsTo(models.User, {
        as: "User",
        foreignKey: {
          name: "userId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  PqrsResponse.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      pqrsId: {
        comment: "Clave foránea hacia Pqrs.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      userId: {
        comment: "Clave foránea hacia Users.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      description: {
        comment: "Descripción del registro.",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      fileUri: {
        comment: "URL del archivo adjunto.",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      comment: "Respuestas emitidas frente a una PQRS.",
      sequelize,
      modelName: "PqrsResponse",
      tableName: "PqrsResponses",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.fileUri = transformReceivedUriToSave(obj.fileUri);
        },
        beforeUpdate: (obj, options) => {
          obj.fileUri = transformReceivedUriToSave(obj.fileUri);
        },
        afterCreate: (obj, options) => {
          obj.fileUri = transformSavedUriToSend(obj.fileUri);
        },
        afterUpdate: (obj, options) => {
          obj.fileUri = transformSavedUriToSend(obj.fileUri);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            result.forEach((obj) => {
              obj.dataValues.fileUri = transformSavedUriToSend(obj.fileUri);
            });
          } else if (result) {
            result.dataValues.fileUri = transformSavedUriToSend(result.fileUri);
          }
        },
      },
    }
  );
  return PqrsResponse;
};