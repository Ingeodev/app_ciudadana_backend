require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require("http-status-codes");
const webTourismAPI = require("./v1/routes/webTourismServicesAPI.js");
const webRoutesAPI = require("./v1/routes/webTransportRoutesAPI.js");
const mobileRouter = require("./v1/routes/mobile.js");
const webRouter = require("./v1/routes/web.js");
const errorHandler = require("../../middleware/errorMiddleware.js");

const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

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

// const allowCrossDomain = function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
//   res.setHeader('Access-Control-Allow-Methods', '*');
//   res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
//   res.setHeader('Access-Control-Max-Age', '1000');
//   res.setHeader('X-Frame-Options', 'SAMEORIGIN');
//   next();
// }
// app.use(allowCrossDomain);

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use("/api/web/v1/third_parties/tourism_company_api", webTourismAPI);
app.use("/api/web/v1/third_parties/transport_company_api", webRoutesAPI);

//#region Web-oriented end-points
app.use("/api/web/v1/third_parties", webRouter);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/third_parties", mobileRouter);
//#endregion

// Not found route
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = StatusCodes.NOT_FOUND;
  return next(error);
});

app.use(errorHandler);

app.listen(3000, function () {
  console.log("running with port 3000");
});
