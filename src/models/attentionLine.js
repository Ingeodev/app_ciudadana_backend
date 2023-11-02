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
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      whatsapp: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "AttentionLine",
      tableName: "AttentionLines",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return AttentionLine;
};
