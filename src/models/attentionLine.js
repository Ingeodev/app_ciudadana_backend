"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AttentionLine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AttentionLine.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageSiteUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      whatsapp: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        // ! allowNull: true?
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        // ! allowNull: true?
      },
    },
    {
      sequelize,
      modelName: "AttentionLine",
      tableName: "AttentionLines",
      schema: "public",
    }
  );
  return AttentionLine;
};
