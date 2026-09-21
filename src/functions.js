process.env.NODE_ENV = process.env.NODE_ENV || "production";

const { onRequest } = require("firebase-functions/v2/https");
const { app } = require("./app");

exports.appCiudadanaApi = onRequest(
  {
    region: "us-west1",
    memory: "1GiB",
    timeoutSeconds: 300,
    concurrency: 80,
    secrets: [
      "DB_HOST",
      "DB_PORT",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
      "SENDGRID_API_KEY",
      "SENDGRID_EMAIL",
      "SIGMA_ACCOUNT_KEY",
      "FIREBASE_STORAGE_BUCKET",
      "NODE_ENV",
      "PORT",
      "FIREBASE_SERVICE_ACCOUNT_PATH",
      "EMAIL_PROVIDER",
      "GMAIL_USER",
      "GMAIL_APP_PASSWORD",
    ],
  },
  app
);