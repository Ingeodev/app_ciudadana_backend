'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserApiKey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserApiKey.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });

      UserApiKey.belongsTo(models.TourismCompany, {
        foreignKey: {
          name: "tourismCompanyId",
          allowNull: true,
          unique: false,
        },
      });

      UserApiKey.belongsTo(models.TransportCompany, {
        foreignKey: {
          name: "transportCompanyId",
          allowNull: true,
          unique: false,
        },
      });
    }
  }
  UserApiKey.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        comment: "Usuario que creó el registro (clave foránea).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      tourismCompanyId: {
        comment: "Clave foránea hacia TourismCompanies.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      transportCompanyId: {
        comment: "Clave foránea hacia TransportCompanies.id.",
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      key: {
        comment: "Campo key (TEXT).",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      expirationAt: {
        comment: "Campo expirationAt (DATE).",
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Claves API emitidas a los usuarios para integraciones.",
      sequelize,
      modelName: "UserApiKey",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_userApiKey",
          unique: true,
          fields: ["createdBy", "tourismCompanyId", "transportCompanyId"],
        },
        {
          name: "idx_unique_userApiKey_key",
          unique: true,
          fields: ["key"],
        },
      ],
    }
  );
  return UserApiKey;
};