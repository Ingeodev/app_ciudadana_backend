'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Advertisement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Advertisement.belongsTo(models.MobileService, {
        foreignKey: {
          name: "categoryId",
          allowNull: true,
        },
      });
    }
  }
  Advertisement.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    imageUri: DataTypes.STRING,
    siteUri: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'Advertisement',
    paranoid: true,
    timestamps: true,
  });
  return Advertisement;
};