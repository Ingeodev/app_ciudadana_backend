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
