"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Security extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Security.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      route: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      subtitle: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      accessLevel: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "MobileService",
      tableName: "MobileService",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return Security;
};
