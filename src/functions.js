process.env.NODE_ENV = process.env.NODE_ENV || "production";

const { onRequest } = require("firebase-functions/v2/https");
const { app } = require("./app");

exports.appCiudadanaApi = onRequest(
  {
    region: "us-west1",
    memory: "1GiB",
    timeoutSeconds: 300,
    concurrency: 80,
  },
  app
);