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
      // DocumentType.hasOne(models.User, {
      //   foreignKey: {
      //     name: "documentTypeId",
      //     allowNull: true,
      //   },
      // });
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
      modelName: "DocumentType",
      tableName: "DocumentTypes",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return DocumentType;
};
