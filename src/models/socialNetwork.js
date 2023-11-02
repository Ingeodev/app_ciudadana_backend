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
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      socialNetworkTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "SocialNetwork",
      tableName: "SocialNetwork",
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
