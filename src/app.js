require("./config/dotenv");
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
const webTourismAPI = require("./microservices/thirdParties/v1/routes/webTourismServicesAPI.js");
const webRoutesAPI = require("./microservices/thirdParties/v1/routes/webTransportRoutesAPI.js");
const mobileThirdPartiesRouter = require("./microservices/thirdParties/v1/routes/mobile.js");
const webThirdPartiesRouter = require("./microservices/thirdParties/v1/routes/web.js");

// File Management
const uploadRouter = require("./microservices/fileManagement/v1/routes/upload.js");
const downloadRouter = require("./microservices/fileManagement/v1/routes/download.js");

// Admin
const webRoleRouter = require("./microservices/admin/v1/routes/webRole");
const webAdminRouter = require("./microservices/admin/v1/routes/webAdmin");
const webAdminFreeRouter = require("./microservices/admin/v1/routes/webAdminFree");

// Traffic
const mobileTrafficRouter = require("./microservices/traffic/v1/routes/mobile.js");
const webTrafficRouter = require("./microservices/traffic/v1/routes/web.js");

const app = express();

// Skip bodyParser for file upload routes (multer handles multipart itself)
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/web/v1/file_management/upload')) {
    return next();
  }
  bodyParser.json()(req, res, next);
});
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use("/api/web/v1/admin/admin", webAdminFreeRouter);

//#region download end-points
app.use("/api/v1/file_management/download", downloadRouter);
//#endregion
//#region upload end-points
app.use("/api/web/v1/file_management/upload", uploadRouter);
//#endregion

//#region Web-oriented end-points
app.use('/api/web', authMiddleware);
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
app.use("/api/web/v1/third_parties/tourism_company_api", webTourismAPI);
app.use("/api/web/v1/third_parties/transport_company_api", webRoutesAPI);

//#region Web-oriented end-points
app.use("/api/web/v1/third_parties", webThirdPartiesRouter);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/third_parties", mobileThirdPartiesRouter);
//#endregion

//#region Web-oriented end-points
app.use("/api/web/v1/admin/role", webRoleRouter);
app.use("/api/web/v1/admin/admin", webAdminRouter);

//#endregion

//#region Web-oriented end-points
app.use("/api/web/v1/traffic", webTrafficRouter);
//#endRegion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/traffic", mobileTrafficRouter);
//#endRegion


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

module.exports = { app };