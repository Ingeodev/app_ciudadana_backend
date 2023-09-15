require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require("http-status-codes");
const { authMiddleware }= require('../../middleware/authMiddleware.js');
const webCategories = require("./v1/routes/webCategories.js");
const webCompanies = require("./v1/routes/webCompanies.js");
const webCompServices = require("./v1/routes/webCompanyServices.js");
const webRouteDate = require("./v1/routes/webRouteTimetableDate.js");
const webRouteHourTariff= require("./v1/routes/webRouteTimetableHour.js");
const webTranspRoutes = require("./v1/routes/webTransportRoutes.js");
const webTranspCompanies = require("./v1/routes/webTransportCompanies.js");
const webCities = require("./v1/routes/webCities.js");
const mobileRouter = require("./v1/routes/mobile.js");
const errorHandler = require("../../middleware/errorMiddleware.js");

const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use(authMiddleware);
//#region Web-oriented end-points
app.use("/api/web/v1/third_parties/city", webCities);
app.use("/api/web/v1/third_parties/categories", webCategories);
app.use("/api/web/v1/third_parties/company", webCompanies);
app.use("/api/web/v1/third_parties/company_service", webCompServices);
app.use("/api/web/v1/third_parties/transport_company/route/date", webRouteDate);
app.use("/api/web/v1/third_parties/transport_company/route/hour", webRouteHourTariff);
app.use("/api/web/v1/third_parties/transport_company/route", webTranspRoutes);
app.use("/api/web/v1/third_parties/transport_company", webTranspCompanies);
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
