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

      User.hasMany(models.Report, {
        foreignKey: {
          name: "userId",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.ReportConfiguration, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
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

      User.belongsTo(models.DocumentType, {
        foreignKey: {
          name: "documentTypeId",
          allowNull: true,
        },
      });

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

      User.hasMany(models.RoadState, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.TrafficNotification, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      User.hasMany(models.TaxiComplaint, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
      
      User.hasMany(models.BicyclesTermCondition, {
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
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      roleId: {
        comment: "Clave foránea hacia Roles.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      clientId: {
        comment: "Identificador de referencia a otra entidad (clave foránea).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        comment: "Nombre del registro."
      },
      lastName: {
        type: DataTypes.STRING,
        comment: "Campo lastName (VARCHAR(255))."
      },
      email: {
        comment: "Correo electrónico de contacto.",
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      emailVerified: {
        comment: "Campo emailVerified (TIMESTAMP WITH TIME ZONE).",
        type: DataTypes.DATE,
        allowNull: true,
        unique: false,
      },
      tokenEmailVerified: {
        comment: "Campo tokenEmailVerified (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      passwdReset: {
        comment: "Campo passwdReset (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      documentTypeId: {
        comment: "Clave foránea hacia DocumentTypes.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      document: {
        comment: "Campo document (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      phone: {
        comment: "Teléfono de contacto.",
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: false,
      },
      address: {
        comment: "Dirección de contacto.",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      serviceReceiptUri: {
        comment: "Campo serviceReceiptUri (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      loginPhase: {
        comment: "Campo loginPhase (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      disabled: {
        comment: "Indica si el registro está deshabilitado.",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      userMobile: {
        comment: "Campo userMobile (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      pushDeviceToken: {
        comment: "Campo pushDeviceToken (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      acceptBicycleTerms: {
        comment: "Campo acceptBicycleTerms (TIMESTAMPZ).",
        type: "TIMESTAMPZ",
        allowNull: true,
        unique: false,
      },
    },
    {
      comment: "Usuarios registrados en la aplicación, con sus datos de identidad, contacto y estado.",
      sequelize,
      modelName: "User",
      tableName: "Users",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_users_document",
          unique: true,
          fields: ["document", "documentTypeId"],
        },
      ],
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
