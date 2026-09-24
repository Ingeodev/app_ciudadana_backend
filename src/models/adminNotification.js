"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdminNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AdminNotification.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      type: {
        comment: "Campo type (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
      },
      referenceId: {
        comment: "Identificador de referencia a otra entidad (clave foránea).",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tableName: {
        comment: "Campo tableName (VARCHAR(255)).",
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        comment: "Mensaje o contenido textual.",
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        comment: "Estado del registro.",
        type: DataTypes.ENUM("UNREAD", "READ", "ARCHIVED"),
        defaultValue: "UNREAD",
      },
    },
    {
      comment: "Notificaciones administrativas internas: avisos dirigidos a usuarios sobre una entidad referenciada (por tipo y referencia).",
      sequelize,
      modelName: "AdminNotification",
      tableName: "AdminNotifications",
      schema: "public",
      paranoid: true,
      timestamps: true,
    }
  );
  return AdminNotification;
};
