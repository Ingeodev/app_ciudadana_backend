'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "tokenEmailVerified", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Users", "emailVerified", {
      type: Sequelize.DATE,
      allowNull: true,
      unique: false,
    });
    await queryInterface.addColumn("Users", "passwdReset", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      unique: false,
    });
    await queryInterface.addColumn("Users", "acceptBicycleTerms", {
      type: "TIMESTAMPTZ",
      allowNull: false,
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "acceptBicycleTerms");
    await queryInterface.removeColumn("Users", "passwdReset");
    await queryInterface.removeColumn("Users", "emailVerified");
    await queryInterface.removeColumn("Users", "tokenEmailVerified");
  }
};
