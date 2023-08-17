'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdvertisementCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AdvertisementCategory.hasOne(models.Advertisement, {
        foreignKey: {
          name: "categoryId",
          allowNull: true
        }
      });
    }
  }
  AdvertisementCategory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    color: DataTypes.STRING(10),
  }, {
    sequelize,
    modelName: 'AdvertisementCategory',
    timestamps: true,
    paranoid: true,
  });
  return AdvertisementCategory;
};