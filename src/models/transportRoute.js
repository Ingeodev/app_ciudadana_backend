"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransportRoute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TransportRoute.belongsTo(models.City, {
        as: "originName",
        foreignKey: {
          name: "origin",
          allowNull: false,
          unique: false,
        },
        targetKey: "id",
      });

      TransportRoute.belongsTo(models.City, {
        as: "destinationName",
        foreignKey: {
          name: "destination",
          allowNull: false,
          unique: false,
        },
        targetKey: "id",
      });

      TransportRoute.hasMany(models.RouteTimetable, {
        foreignKey: {
          name: "routeId",
          allowNull: false,
          unique: false,
        },
      });

      TransportRoute.belongsTo(models.TransportCompany, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
          unique: false,
        },
      });

      TransportRoute.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TransportRoute.init(
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
      origin: {
        comment: "Clave foránea hacia Cities.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      destination: {
        comment: "Clave foránea hacia Cities.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      companyId: {
        comment: "Clave foránea hacia TransportCompanies.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      duration: {
        comment: "Campo duration (INTEGER).",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Rutas del sistema de transporte público.",
      sequelize,
      modelName: "TransportRoute",
      tableName: "TransportRoutes",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_origin_destination_companyId",
          unique: true,
          fields: ["origin", "destination", "companyId"],
        }
      ],
    }
  );
  return TransportRoute;
};
