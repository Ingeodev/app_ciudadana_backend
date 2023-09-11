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
        foreignKey: {
          name: "origin",
          allowNull: false,
          unique: false,
        },
      });

      TransportRoute.belongsTo(models.City, {
        foreignKey: {
          name: "destination",
          allowNull: false,
          unique: false,
        },
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
    },
    {
      sequelize,
      modelName: "TransportRoute",
      tableName: "TransportRoutes",
      schema: "public",
      paranoid: true,
      timestamps: true,
      // hooks: {
      //   // It also eliminates the services that the company has
      //   beforeDestroy: async (company, options) => {
      //     try {
      //       await company.getThirdPartyServices().then((services) => {
      //         services.forEach(async (service) => {
      //           await service.destroy({ force: false }); // Here, force: false, makes it a soft-delete.
      //         });
      //       });
      //     } catch (error) {
      //       throw new Error("Error deleting company services");
      //     }
      //   },
      // },
    }
  );
  return TransportRoute;
};
