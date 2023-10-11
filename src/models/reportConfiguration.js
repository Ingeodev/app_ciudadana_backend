"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReportConfiguration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ReportConfiguration.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  ReportConfiguration.init(
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
      automaticApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "ReportConfiguration",
      tableName: "ReportConfigurations",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return ReportConfiguration;
};
