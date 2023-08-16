"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SecurityCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SecurityCategory.init(
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
        unique: true,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      siteUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "SecurityCategory",
      tableName: "SecurityCategories",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return SecurityCategory;
};
