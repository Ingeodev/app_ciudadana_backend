const { Sequelize, DataTypes, Model } = require('sequelize');
// call env variables
const dbHost = process.env.INSTANCE_CONNECTION_NAME;
const dbUser =  process.env.SQL_USER;
const dbPassword = process.env.SQL_PASSWORD;
const dbDatabase = process.env.SQL_DATABASE;

let sequelizeConnector = new Sequelize(dbDatabase, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'postgres'
});

const User = sequelizeConnector.define('User', {
  firebase_id: {type: DataTypes.STRING, allowNull: false},
  first_name: { type: DataTypes.STRING, allowNull: false},
  last_name: { type: DataTypes.STRING, allowNull: false},
  birthdate: { type: DataTypes.DATE, allowNull: false},
  phone_number: { type: DataTypes.STRING, allowNull: false},
  email: {type: DataTypes.STRING, allowNull: true},
  terms_and_conditions: {type: DataTypes.BOOLEAN, allowNull: false},
  created_at: {type: DataTypes.NOW, allowNull: false},
}, {
  tableName: 'users', underscored: true, timestamps: true, createdAt: 'created_at',
  updatedAt: false, deletedAt: false
});

module.exports = {
  User,
};


