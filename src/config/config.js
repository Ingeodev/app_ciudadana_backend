require("./dotenv");

const { UTC_ZONE_DB } = require("./utc_zone.json");

const encodeCredential = (str = "") =>
  encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || "5432";
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: console.log,
    timezone: UTC_ZONE_DB,
    dialectOptions: {
      useUTC: false,
    },
  },
    test: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: console.log,
    timezone: UTC_ZONE_DB,
    dialectOptions: {
      useUTC: false,
    },
  },
  production: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: false,
    timezone: UTC_ZONE_DB,
    dialectOptions: {
      useUTC: false,
    },
  },
};
