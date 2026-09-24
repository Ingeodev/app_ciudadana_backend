"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ThirdPartyService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ThirdPartyService.belongsTo(models.ThirdPartyCompany, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  ThirdPartyService.init(
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
      },
      companyId: {
        comment: "Clave foránea hacia ThirdPartyCompanies.id.",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      comment: "Servicios ofrecidos por las empresas de terceros.",
      sequelize,
      modelName: "ThirdPartyService",
      tableName: "ThirdPartyServices",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_thirdPartyCompanyId_service",
          unique: true,
          fields: ["companyId", "service"],
        },
      ],
    }
  );
  return ThirdPartyService;
};
