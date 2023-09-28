require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require('http-status-codes');

const errorHandler = require('./middleware/errorMiddleware');
const { authMiddleware }= require('./middleware/authMiddleware.js');

// Notifications
const webRouterNotification = require("./microservices/notifications/v1/routes/web");
const mobileRouterNotification = require("./microservices/notifications/v1/routes/mobile");

// Users
const webRouterUser = require("./microservices/users/v1/routes/web.js");
const mobileRouterUser = require("./microservices/users/v1/routes/mobile.js");

// Third parties
const webCategories = require("./microservices/thirdParties/v1/routes/webCategories.js");
const webCompanies = require("./microservices/thirdParties/v1/routes/webCompanies.js");
const webTourismCategories = require("./microservices/thirdParties/v1/routes/webTourismCategories.js");
const webCompServices = require("./microservices/thirdParties/v1/routes/webCompanyServices.js");
const webRouteDate = require("./microservices/thirdParties/v1/routes/webRouteTimetableDate.js");
const webRouteHourTariff= require("./microservices/thirdParties/v1/routes/webRouteTimetableHour.js");
const webTranspRoutes = require("./microservices/thirdParties/v1/routes/webTransportRoutes.js");
const webTranspCompanies = require("./microservices/thirdParties/v1/routes/webTransportCompanies.js");
const webCities = require("./microservices/thirdParties/v1/routes/webCities.js");
const mobileRouterThird = require("./microservices/thirdParties/v1/routes/mobile.js");

// File Management
const uploadRouter = require("./microservices/fileManagement/v1/routes/upload.js");
const downloadRouter = require("./microservices/fileManagement/v1/routes/download.js");

// Admin
const webRoleRouter = require("./microservices/admin/v1/routes/webRole");
const webAdminRouter = require("./microservices/admin/v1/routes/webAdmin");
const webAdminFreeRouter = require("./microservices/admin/v1/routes/webAdminFree");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use("/api/web/v1/admin/admin", webAdminFreeRouter);

//#region download end-points
app.use("/api/v1/file_management/download", downloadRouter);
//#endregion

app.use(authMiddleware);
//#region Web-oriented end-points
app.use('/api/web/v1/notifications', webRouterNotification);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/notifications", mobileRouterNotification);
//#endregion

//#region Web-oriented end-points
app.use('/api/web/v1/users', webRouterUser);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/users", mobileRouterUser);
//#endregion

//#region Web-oriented end-points
app.use("/api/web/v1/third_parties/city", webCities);
app.use("/api/web/v1/third_parties/categories", webCategories);
app.use("/api/web/v1/third_parties/tourism_categories", webTourismCategories);
app.use("/api/web/v1/third_parties/company", webCompanies);
app.use("/api/web/v1/third_parties/company_service", webCompServices);
app.use("/api/web/v1/third_parties/transport_company/route/date", webRouteDate);
app.use("/api/web/v1/third_parties/transport_company/route/hour", webRouteHourTariff);
app.use("/api/web/v1/third_parties/transport_company/route", webTranspRoutes);
app.use("/api/web/v1/third_parties/transport_company", webTranspCompanies);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/third_parties", mobileRouterThird);
//#endregion

//#region upload end-points
app.use("/api/web/v1/file_management/upload", uploadRouter);
//#endregion

//#region Web-oriented end-points
app.use("/api/web/v1/admin/role", webRoleRouter);
app.use("/api/web/v1/admin/admin", webAdminRouter);

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

app.listen(3001, function () {
  console.log("running with port 3001");
});
