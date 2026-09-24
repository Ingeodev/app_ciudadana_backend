"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TaxiComplaint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TaxiComplaint.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  TaxiComplaint.init(
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
      type: {
        comment: "Campo type (ENUM).",
        type: DataTypes.ENUM("driver", "vehicle"),
        allowNull: false,
        unique: false,
      },
      complaintType: {
        comment: "Campo complaintType (ENUM).",
        type: DataTypes.ENUM(
          "unauthorized_driver",
          "vehicle_poor_condition",
          "overcharge",
          "inappropriate_behavior",
          "excessive_speed"
        ),
        allowNull: false,
        unique: false,
      },
      description: {
        comment: "Descripción del registro.",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
      identifier: {
        comment: "Campo identifier (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Quejas sobre el servicio de taxi, por tipo de denuncia.",
      sequelize,
      modelName: "TaxiComplaint",
      tableName: "TaxiComplaints",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return TaxiComplaint;
};
