"use strict";
const { Model } = require("sequelize");
const { transformReceivedUriToSave, transformSavedUriToSend } = require("../utils/uriTransformer");
module.exports = (sequelize, DataTypes) => {
  class SocialNetwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SocialNetwork.belongsTo(models.SocialNetworkType, {
        foreignKey: {
          name: "socialNetworkTypeId",
          allowNull: true,
        },
      });
    }
  }
  SocialNetwork.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      socialNetworkTypeId: {
        comment: "Clave foránea hacia SocialNetworkTypes.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      url: {
        comment: "Campo url (TEXT).",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      icon: {
        comment: "Campo icon (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      active: {
        comment: "Campo active (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      comment: "Redes sociales registradas de las empresas o servicios.",
      sequelize,
      modelName: "SocialNetwork",
      tableName: "SocialNetworks",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        beforeCreate: (obj, options) => {
          obj.icon = transformReceivedUriToSave(obj.icon);
        },
        beforeUpdate: (obj, options) => {
          obj.icon = transformReceivedUriToSave(obj.icon);
        },
        afterCreate: (obj, options) => {
          obj.icon = transformSavedUriToSend(obj.icon);
        },
        afterUpdate: (obj, options) => {
          obj.icon = transformSavedUriToSend(obj.icon);
        },
        afterFind: (result, options) => {
          if (Array.isArray(result)) {
            // If the result is an array (multiple records)
            result.forEach((obj) => {
              obj.dataValues.icon = transformSavedUriToSend(obj.icon);
            });
          } else if (result) {
            // If the result is a single record
            result.dataValues.icon = transformSavedUriToSend(result.icon);
          }
        },
      },
    }
  );
  return SocialNetwork;
};
