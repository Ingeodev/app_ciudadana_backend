"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Role.hasMany(models.User, {
        foreignKey: {
          name: "roleId",
          allowNull: false,
        },
      });
    }
  }
  Role.init(
    {
      id: {
        comment: "Identificador único del registro (clave primaria).",
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        comment: "Nombre del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      description: {
        comment: "Descripción del registro.",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      permission: {
        comment: "Permisos asignados al rol.",
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
      },
    },
    {
      comment: "Catálogo de roles de los usuarios de la aplicación.",
      sequelize,
      modelName: "Role",
      tableName: "Roles",
      schema: "public",
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          name: "idx_unique_roles_name",
          unique: true,
          fields: ["name"],
        }
      ],
    }
  );
  return Role;
};
