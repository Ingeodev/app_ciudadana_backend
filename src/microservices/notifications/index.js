require("../../config/dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require('http-status-codes');

const errorHandler = require('../../middleware/errorMiddleware');
const webRouter = require("./v1/routes/web");
const mobileRouter = require("./v1/routes/mobile");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.json());
const corsOptions = {
  origin: "*",
  allowedHeaders: [
    "Origin",
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-MD5",
    "Content-Type",
    "Date",
    "X-Api-Version",
    "X-Response-Time",
    "X-PINGOTHER",
    "X-CSRF-Token",
    "Authorization",
  ],
  methods: "*",
  exposedHeaders: ["X-Api-Version", "X-Request-Id", "X-Response-Time"],
  maxAge: 1000,
  preflightContinue: false, // It is the default value.
  optionsSuccessStatus: 204, // It is the default value.
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

//#region Web-oriented end-points
app.use('/api/web/v1/notifications', webRouter);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/notifications", mobileRouter);
//#endregion

//#region Error handling
// Not found route!
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = StatusCodes.NOT_FOUND;
  return next(error);
});

// Error Handler!
app.use(errorHandler);
//#endregion

app.listen(3000, function () {
  console.log("running with port 3000");
});
