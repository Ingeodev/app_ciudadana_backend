"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SocialNetworkType extends Model {
    static associate(models) {
    }
  }
  SocialNetworkType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "SocialNetworkType",
      tableName: "SocialNetworkType",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return SocialNetworkType;
};
