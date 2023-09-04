'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('SecurityCategories', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
    return await queryInterface.removeConstraint('SecurityCategories', 'SecurityCategories_name_key');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('SecurityCategories', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  }
};
