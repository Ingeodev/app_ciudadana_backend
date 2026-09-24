"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TourismService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TourismService.belongsTo(models.TourismCompany, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TourismService.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      service: {
        comment: "Campo service (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      companyId: {
        comment: "Clave foránea hacia TourismCompanies.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Servicios turísticos ofrecidos.",
      sequelize,
      modelName: "TourismService",
      tableName: "TourismServices",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_tourismServices_service",
          unique: true,
          fields: ["companyId", "service"],
        },
      ],
    }
  );
  return TourismService;
};
