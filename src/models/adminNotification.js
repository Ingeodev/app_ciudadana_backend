"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdminNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AdminNotification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tableName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("UNREAD", "READ", "ARCHIVED"),
        defaultValue: "UNREAD",
      },
    },
    {
      sequelize,
      modelName: "AdminNotification",
      tableName: "AdminNotifications",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return AdminNotification;
};
