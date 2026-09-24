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

      Pqrs.hasMany(models.PqrsResponse, {
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
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      radicado: {
        comment: "Campo radicado (VARCHAR(30)).",
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      typeSol: {
        comment: "Campo typeSol (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      firstName: {
        comment: "Campo firstName (VARCHAR(50)).",
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: false,
      },
      secondName: {
        comment: "Campo secondName (VARCHAR(50)).",
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: false,
      },
      firstLastName: {
        comment: "Campo firstLastName (VARCHAR(50)).",
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: false,
      },
      secondLastName: {
        comment: "Campo secondLastName (VARCHAR(50)).",
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: false,
      },
      documentTypeId: {
        comment: "Clave foránea hacia DocumentTypes.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      doc: {
        comment: "Campo doc (VARCHAR(20)).",
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: false,
      },
      nit: {
        comment: "Campo nit (VARCHAR(20)).",
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: false,
      },
      corporation: {
        comment: "Campo corporation (VARCHAR(150)).",
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: false,
      },
      direction: {
        comment: "Dirección de contacto.",
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: false,
      },
      email: {
        comment: "Correo electrónico de contacto.",
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: false,
      },
      cel: {
        comment: "Teléfono celular de contacto.",
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      phone: {
        comment: "Teléfono de contacto.",
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      country: {
        comment: "Código del país.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      province: {
        comment: "Código de la provincia o departamento.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      city: {
        comment: "Código de la ciudad.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      requestTypeId: {
        comment: "Identificador de referencia a otra entidad (clave foránea).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      content: {
        comment: "Campo content (TEXT).",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      dependencyId: {
        comment: "Clave foránea hacia Dependencies.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      responseChannel: {
        comment: "Campo responseChannel (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      fileUri: {
        comment: "URL del archivo adjunto.",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      userId: {
        comment: "Clave foránea hacia Users.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
    },
    {
      comment: "Peticiones, quejas, reclamos y sugerencias (PQRS) ingresadas por los ciudadanos.",
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