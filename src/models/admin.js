"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.belongsTo(models.DocumentType, {
        foreignKey: {
          name: "documentTypeId",
          allowNull: true,
        },
      });

      // Admin.belongsTo(models.Role, {
      //   foreignKey: {
      //     name: "roleId",
      //     allowNull: false,
      //   },
      // });
    }
  }
  Admin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
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
        // ! Verificar si Firebase en ocasiones email=null
        allowNull: false,
        unique: true,
      },
      documentTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      numberDocument: {
        type: DataTypes.STRING,
        allowNull: false,
        // ! unique: true? Diversidad de tipos de documentos
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
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
      disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "Admin",
      tableName: "Admins",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return Admin;
};
