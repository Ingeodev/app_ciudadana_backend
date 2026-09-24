"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      City.hasMany(models.TransportRoute, {
        as: "originName",
        foreignKey: {
          name: "origin",
          allowNull: false,
          unique: false,
        },
        targetKey: "id",
      });
      City.hasMany(models.TransportRoute, {
        as: "destinationName",
        foreignKey: {
          name: "destination",
          allowNull: false,
          unique: false,
        },
        targetKey: "id",
      });
    }
  }
  City.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      city: {
        comment: "Código de la ciudad.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      cityCode: {
        comment: "Campo cityCode (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      state: {
        comment: "Campo state (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      comment: "Catálogo de ciudades soportadas por la aplicación.",
      sequelize,
      modelName: "City",
      tableName: "Cities",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_cityCode",
          unique: true,
          fields: ["cityCode"],
        },
        {
          name: "idx_unique_city_state",
          unique: true,
          fields: ["city", "state"],
        },
      ],
    }
  );
  return City;
};
