"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class ThirdPartyCompany extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ThirdPartyCompany.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      ThirdPartyCompany.belongsTo(models.ThirdPartyCategory, {
        foreignKey: {
          name: "categoryId",
          allowNull: false,
          unique: false,
        },
      });

      ThirdPartyCompany.hasMany(models.ThirdPartyService, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  ThirdPartyCompany.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      nit: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      siteUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
        unique: false,
      },
      lon: {
        type: DataTypes.FLOAT,
        allowNull: false,
        unique: false,
      },
      geolocation: {
        type: DataTypes.GEOMETRY,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "ThirdPartyCompany",
      tableName: "ThirdPartyCompanies",
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
  return ThirdPartyCompany;
};
