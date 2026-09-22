"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class Pqrs extends Model {
    static associate(models) {
      Pqrs.belongsTo(models.Dependency, {
        foreignKey: {
          name: "dependencyId",
          allowNull: false,
          unique: false,
        },
      });

      Pqrs.belongsTo(models.DocumentType, {
        foreignKey: {
          name: "documentTypeId",
          allowNull: true,
          unique: false,
        },
      });

      Pqrs.belongsTo(models.User, {
        foreignKey: {
          name: "userId",
          allowNull: true,
          unique: false,
        },
      });

      Pqrs.hasMany(models.PqrsStatus, {
        foreignKey: {
          name: "pqrsId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  Pqrs.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      radicado: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      typeSol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: false,
      },
      secondName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: false,
      },
      firstLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: false,
      },
      secondLastName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: false,
      },
      documentTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      doc: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: false,
      },
      nit: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: false,
      },
      corporation: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: false,
      },
      direction: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: false,
      },
      cel: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      country: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      province: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      city: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      requestTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      dependencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      responseChannel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      fileUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "Pqrs",
      tableName: "Pqrs",
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
  return Pqrs;
};