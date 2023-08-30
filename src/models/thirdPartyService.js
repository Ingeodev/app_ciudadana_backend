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
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      service: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // unique: false,
      },
    },
    {
      sequelize,
      modelName: "ThirdPartyService",
      tableName: "ThirdPartyServices",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["companyId", "service"],
        },
      ],
    }
  );
  return ThirdPartyService;
};
