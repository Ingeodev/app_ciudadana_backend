"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GenderCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GenderCategory.belongsTo(models.User, {
        foreignKey: {
          name: "createdBy",
          allowNull: false,
          unique: false,
        },
      });
    }
  }
  GenderCategory.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      imageUri: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "GenderCategory",
      tableName: "GenderCategories",
      schema: "public",
      paranoid: true,
      timestamps: true,
      hooks: {
        async beforeDestroy(genderCategory, options) {
          const attentionLinesCount = await sequelize.models.GenderAttentionLine.count({
              where: {
                categoryId: genderCategory.id,
                deletedAt: null, // considers only records that are not "soft deleted".
              },
            });

          if (attentionLinesCount > 0) {
            throw new Error("Category Deleting error");
          }
        },
      },
    }
  );
  return GenderCategory;
};
