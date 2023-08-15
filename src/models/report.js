"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.SecurityCategory, {
        foreignKey: {
          name: "securityCategoryId",
          allowNull: true,
        },
      });

      Report.belongsTo(models.User, {
        foreignKey: {
          name: "userId",
          allowNull: true,
        },
      });
    }
  }
  Report.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      securityCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lon: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Report",
      tableName: "Reports",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return Report;
};
