module.exports = {
  HOST: "localhost",
  USER: "postgres",
  PASSWORD: "123456",
  DB: "testdb",
  dialect: "postgres",
  SCHEMA: "testschema",
  pool: {
    // maximum number of connection in pool
    max: 5,
    // minimum number of connection in pool
    min: 0,
    // maximum time, in milliseconds, that pool will try to get connection before throwing error
    acquire: 30000,
    // maximum time, in milliseconds, that a connection can be idle before being released
    idle: 10000,
  },
};
