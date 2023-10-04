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
          name: "userId",
          allowNull: false,
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      module: {
        type: DataTypes.ENUM("TOURISM", "TRANSPORTROUTES"),
        // defaultValue: "NULL",
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
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
    }
  );
  return UserApiKey;
};