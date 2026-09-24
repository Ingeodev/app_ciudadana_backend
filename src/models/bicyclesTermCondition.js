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
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      termsConditions: {
        comment: "Campo termsConditions (TEXT).",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Términos y condiciones de uso del servicio de bicicletas compartidas.",
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
