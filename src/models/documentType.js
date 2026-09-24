"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DocumentType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DocumentType.hasMany(models.User, {
        foreignKey: {
          name: "documentTypeId",
          allowNull: true,
        },
      });
    }
  }
  DocumentType.init(
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
      comment: "Catálogo de tipos de documento de identidad.",
      sequelize,
      modelName: "DocumentType",
      tableName: "DocumentTypes",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_documentType_code",
          unique: true,
          fields: ["code"],
        },
        {
          name: "idx_unique_documentType_name",
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );
  return DocumentType;
};
