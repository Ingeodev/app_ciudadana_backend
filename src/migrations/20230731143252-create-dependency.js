'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Dependencies", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      email: {
        type: Sequelize.STRING(50),
        // ! Verificar si Firebase en ocasiones email=null
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        unique: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        // ! allowNull: true?
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        // ! allowNull: true?
      },
      deleteAt: {
        type: Sequelize.DATE,
        allowNull: true,
        // ! allowNull: true?
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Dependencies");
  }
};