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
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      pqrsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      fileUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
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