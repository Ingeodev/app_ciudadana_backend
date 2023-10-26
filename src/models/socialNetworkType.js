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
        unique: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
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
      tableName: "SocialNetworkTypes",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_socialNetworkType_code",
          unique: true,
          fields: ["code"],
        },
        {
          name: "idx_unique_socialNetworkType_name",
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );
  return SocialNetworkType;
};
