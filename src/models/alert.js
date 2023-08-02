"use strict";
const { Model } = require("DataTypes");
module.exports = (DataTypes, DataTypes) => {
  class Alert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Alert.belongsTo(models.User, {
        foreignKey: {
          name: "sentBy",
          allowNull: false,
        },
      });
    }
  }
  Alert.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      sentBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      siteUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      isSMS: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      isPUSH: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      isAlertList: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      DataTypes,
      modelName: "Alert",
      tableName: "Alerts",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return User;
};
