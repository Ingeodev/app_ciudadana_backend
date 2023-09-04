'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Securities', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
    return await queryInterface.removeConstraint('Securities', 'Securities_name_key');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Securities', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  }
};
