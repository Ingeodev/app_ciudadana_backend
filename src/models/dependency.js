"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dependencies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dependencies.init(
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
      active: {
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
      deleteAt: {
        type: DataTypes.DATE,
        allowNull: true,
        // ! allowNull: true?
      },
    },
    {
      sequelize,
      modelName: "Dependency",
      tableName: "Dependencies",
      schema: "public",
    }
  );
  return Dependencies;
};
