"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AttentionLine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AttentionLine.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      phone: {
        comment: "Teléfono de contacto.",
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
      whatsapp: {
        comment: "Campo whatsapp (VARCHAR(15)).",
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Líneas de atención ciudadana registradas en el sistema.",
      sequelize,
      modelName: "AttentionLine",
      tableName: "AttentionLines",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return AttentionLine;
};
