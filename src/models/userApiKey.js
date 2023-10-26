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
      tourismCompanyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      transportCompanyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      expirationAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
    },
    {
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