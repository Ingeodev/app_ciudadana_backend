"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class TourismCompany extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TourismCompany.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      TourismCompany.belongsTo(models.TourismCategory, {
        foreignKey: {
          name: "categoryId",
          allowNull: false,
          unique: false,
        },
      });

      TourismCompany.hasMany(models.TourismService, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
          unique: false,
        },
      });

      TourismCompany.hasMany(models.UserApiKey, {
        foreignKey: {
          name: "tourismCompanyId",
          allowNull: true,
          unique: false,
        },
      });
    }
  }
  TourismCompany.init(
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
      nit: {
        comment: "Campo nit (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      categoryId: {
        comment: "Clave foránea hacia TourismCategories.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      description: {
        comment: "Descripción del registro.",
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
      siteUri: {
        comment: "URL del sitio o recurso web asociado.",
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
      },
      geolocation: {
        comment: "Punto geográfico (GEOMETRY) con la ubicación.",
        type: DataTypes.GEOMETRY,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Empresas del sector turístico registradas.",
      sequelize,
      modelName: "TourismCompany",
      tableName: "TourismCompanies",
      schema: "public",
      paranoid: true,
      timestamps: true,
      // indexes: [
      //   {
      //     name: "idx_unique_tourism_nit",
      //     unique: true,
      //     fields: ["nit"],
      //   },
      // ],
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
      // hooks: {
      //   // It also eliminates the services that the company has
      //   beforeDestroy: async (company, options) => {
      //     try {
      //       await company.getThirdPartyServices().then((services) => {
      //         services.forEach(async (service) => {
      //           await service.destroy({ force: false }); // Here, force: false, makes it a soft-delete.
      //         });
      //       });
      //     } catch (error) {
      //       throw new Error("Error deleting company services");
      //     }
      //   },
      // },
    }
  );
  return TourismCompany;
};
