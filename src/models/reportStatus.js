"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReportStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ReportStatus.belongsTo(models.Report, {
        foreignKey: {
          name: "reportId",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  ReportStatus.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      status: {
        type: DataTypes.ENUM("APPROVED", "DISAPPROVED", "PENDING"),
        defaultValue: "PENDING",
        allowNull: false,
        unique: false,
        // APPROVED: The report has been approved
        // DISAPPROVED: The report has been disapproved
        // PENDING: The report has been approved/disapproved, and you have a period of time to approve/disapproved it.
      },
    },
    {
      sequelize,
      modelName: "ReportStatus",
      tableName: "ReportStatuses",
      schema: "public",
      paranoid: true,
      timestamps: true,
      // indexes: [
      //   {
      //     name: "idx_unique_reportStatues",
      //     unique: true,
      //     fields: ["reportId", "status"],
      //   },
      // ],
    }
  );
  return ReportStatus;
};
