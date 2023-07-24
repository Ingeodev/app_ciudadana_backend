"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      loginPhase: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "User",
      tableName: "Users",
      schema: "public",
    }
  );
  return User;
};
