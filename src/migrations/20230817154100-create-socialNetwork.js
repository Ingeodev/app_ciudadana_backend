'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      "SocialNetwork",
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
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: false,
        },
        icon: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true,
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
        tableName: "SocialNetwork",
        schema: "public",
      }
    );
    await queryInterface.addConstraint("SocialNetwork", {
      name: "fk_SocialNetwork_SocialNetworkType",
      fields: ["socialNetworkTypeId"],
      type: "foreign key",
      references: {
        table: "SocialNetworkType",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "cascade",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("SocialNetwork", "fk_SocialNetwork_SocialNetworkType");
    await queryInterface.dropTable("SocialNetwork");
  }
};
