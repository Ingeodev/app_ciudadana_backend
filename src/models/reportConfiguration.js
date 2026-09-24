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
      automaticApproval: {
        comment: "Campo automaticApproval (BOOLEAN).",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Configuraciones asociadas a los reportes generados por la aplicación.",
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
