'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      "SocialNetworks",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        socialNetworkTypeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        url: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: false,
        },
        icon: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          unique: false,
        },
        createdAt: {
          type: "TIMESTAMP",
          allowNull: false,
          // type: Sequelize.DATE
        },
        updatedAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // type: Sequelize.DATE
        },
        deletedAt: {
          type: "TIMESTAMP",
          allowNull: true,
          // type: Sequelize.DATE
        },
      },
      {
        tableName: "SocialNetworks",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("SocialNetworks", {
      name: "fk_SocialNetworks_SocialNetworkTypes",
      fields: ["socialNetworkTypeId"],
      type: "foreign key",
      references: {
        table: "SocialNetworkTypes",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("SocialNetworks", "fk_SocialNetworks_SocialNetworkTypes");
    await queryInterface.dropTable("SocialNetworks");
  }
};
