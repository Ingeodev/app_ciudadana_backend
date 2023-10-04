"use strict";

const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Alert, {
        foreignKey: {
          name: "sentBy",
          allowNull: false,
        },
      });

      User.hasMany(models.ThirdPartyCompany, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.TransportCompany, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.GenderCategory, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.GenderAttentionLine, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.SecurityAttentionPoint, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.TourismCategory, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.TourismCompany, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      // User.belongsTo(models.DocumentType, {
      //   foreignKey: {
      //     name: "documentTypeId",
      //     allowNull: true,
      //   },
      // });

      User.belongsTo(models.Role, {
        foreignKey: {
          name: "roleId",
          allowNull: false,
        },
      });

      User.hasMany(models.TransportRoute, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.UserApiKey, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        // ! Verificar si Firebase en ocasiones email=null
        allowNull: true,
        unique: true,
      },
      emailVerified: {
        type: DataTypes.DATE,
        allowNull: true,
        unique: false,
      },
      tokenEmailVerified: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      passwdReset: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      documentTypeId: {
        // type: DataTypes.INTEGER,
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      document: {
        type: DataTypes.STRING,
        allowNull: true,
        // ! unique: true? Diversidad de tipos de documentos
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      serviceReceiptUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      loginPhase: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      userMobile: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      pushDeviceToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.serviceReceiptUri = transformReceivedUriToSave(
            obj.serviceReceiptUri
          );
        },
        beforeUpdate: (obj, options) => {
          obj.serviceReceiptUri = transformReceivedUriToSave(
            obj.serviceReceiptUri
          );
        },
        afterCreate: (obj, options) => {
          obj.serviceReceiptUri = transformSavedUriToSend(
            obj.serviceReceiptUri
          );
        },
        afterUpdate: (obj, options) => {
          obj.serviceReceiptUri = transformSavedUriToSend(
            obj.serviceReceiptUri
          );
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.serviceReceiptUri = transformSavedUriToSend(
                obj.serviceReceiptUri
              );
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.serviceReceiptUri = transformSavedUriToSend(
              result.serviceReceiptUri
            );
          }
        },
      },
    }
  );
  return User;
};
