'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const { UTC_ZONE_DB } = require("../config/utc_zone.json");
const { configureTimezoneTimestamps } = require("../utils/utcZone.js");
const env = process.env.NODE_ENV || 'development';
const db = {};

const isProduction = process.env.NODE_ENV === 'production';

// encodeURIComponent NO escapa algunos caracteres que una URI permite pero que
// SÍ rompen el parsing de userinfo en una URL de conexión: ! ' ( ) *.
// Esta variante los escapa también, para que credenciales con esos caracteres
// (ej. un password con paréntesis) no corrompan la conexión.
const encodeCredential = (str = "") =>
  encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );

// Configuración de conexión a Postgres.
// La URL se CONSTRUYE aquí con un template literal a partir de las variables
// DB_* individuales (que viajan a Cloud Functions vía Secret Manager).
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const dbUrl = `postgres://${encodeCredential(DB_USER)}:${encodeCredential(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const dbOptions = {
  logging: isProduction ? false : console.log,
  dialectOptions: {
    useUTC: false, //for reading from database
  },
  timezone: UTC_ZONE_DB,
};

const sequelize = new Sequelize(dbUrl, dbOptions);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach( (modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].prototype) {
    db[modelName].prototype.toJSON = configureTimezoneTimestamps;
  }  
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
