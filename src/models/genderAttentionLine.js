"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GenderAttentionLine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GenderAttentionLine.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  GenderAttentionLine.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "GenderAttentionLine",
      tableName: "GenderAttentionLines",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return GenderAttentionLine;
};
