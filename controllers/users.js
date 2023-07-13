const Sequelize = require('sequelize');
const db       = require('../models/index');

const createUser = async (firstName, lastName, email) => {
  console.log(db);
  await db.User.create({
    firstName,
    lastName,
    email
  })
}

createUser('pepe', 'perez', 'pepeperez@gmail.com')