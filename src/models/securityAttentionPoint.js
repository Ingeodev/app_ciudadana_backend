'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SecurityAttentionPoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SecurityAttentionPoint.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    color: DataTypes.STRING(10),
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUri: DataTypes.STRING,
    geolocation: DataTypes.GEOMETRY
  }, {
    sequelize,
    modelName: 'SecurityAttentionPoint',
    schema: "public",
    paranoid: true,
    timestamps: true,
  });
  return SecurityAttentionPoint;
};