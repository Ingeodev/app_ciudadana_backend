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
      origin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      destination: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
    },
    {
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
