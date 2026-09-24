"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dependencies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dependencies.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        comment: "Nombre del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Dependencias municipales o entidades oficiales a las que se asocian las PQRS.",
      sequelize,
      modelName: "Dependency",
      tableName: "Dependencies",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return Dependencies;
};
