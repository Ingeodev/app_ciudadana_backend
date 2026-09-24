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
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      code: {
        comment: "Campo code (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      name: {
        comment: "Nombre del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      active: {
        comment: "Campo active (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Catálogo de tipos de red social.",
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
