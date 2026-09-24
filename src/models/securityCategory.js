"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class SecurityCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SecurityCategory.hasMany(models.Report, {
        foreignKey: {
          name: "securityCategoryId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  SecurityCategory.init(
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
      iconMap: {
        comment: "Campo iconMap (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      color: {
        comment: "Color representativo asociado al registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Categorías dentro de la ruta de atención de seguridad.",
      sequelize,
      modelName: "SecurityCategory",
      tableName: "SecurityCategories",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_securityCategory_name",
          unique: true,
          fields: ["name"],
        },
      ],
      hooks: {
        beforeCreate: (obj, options) => {
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        beforeUpdate: (obj, options) => {
          obj.iconMap = transformReceivedUriToSave(obj.iconMap);
        },
        afterCreate: (obj, options) => {
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterUpdate: (obj, options) => {
          obj.iconMap = transformSavedUriToSend(obj.iconMap);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.iconMap = transformSavedUriToSend(obj.iconMap);
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.iconMap = transformSavedUriToSend(result.iconMap);
          }
        },
      },
    }
  );
  return SecurityCategory;
};
