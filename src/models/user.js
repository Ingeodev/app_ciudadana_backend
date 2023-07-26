"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
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
      documentType: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      numberDocument: {
        type: DataTypes.STRING,
        allowNull: true,
        // ! unique: true? Diversidad de tipos de documentos
        unique: true,
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
        unique: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      residenceAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      serviceReceipt: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      loginPhase: {
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
