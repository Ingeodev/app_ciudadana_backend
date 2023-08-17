"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SocialNetwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SocialNetwork.belongsTo(models.socialNetworkType, {
        foreignKey: {
          name: "socialNetworkTypeId",
          allowNull: true,
        },
      });
    }
  }
  SocialNetwork.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      socialNetworkTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
    },
    {
      sequelize,
      modelName: "SocialNetwork",
      tableName: "SocialNetwork",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return SocialNetwork;
};
