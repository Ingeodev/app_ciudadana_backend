"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BicyclesTermCondition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BicyclesTermCondition.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  BicyclesTermCondition.init(
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
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      termsConditions: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "BicyclesTermCondition",
      tableName: "BicyclesTermsConditions",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return BicyclesTermCondition;
};
