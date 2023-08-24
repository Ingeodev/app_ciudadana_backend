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
const webRouterThird = require("./microservices/thirdParties/v1/routes/web.js");
const mobileRouterThird = require("./microservices/thirdParties/v1/routes/mobile.js");

// File Management
const uploadRouter = require("./microservices/fileManagement/v1/routes/upload.js");
const downloadRouter = require("./microservices/fileManagement/v1/routes/download.js");

// Admin
const webRoleRouter = require("./microservices/admin/v1/routes/webRole");
const webAdminRouter = require("./microservices/admin/v1/routes/webAdmin");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

//#region download end-points
app.use("/api/v1/file_management/download", downloadRouter);
//#endregion

app.use(authMiddleware);
//#region Web-oriented end-points
app.use('/web/v1/notifications', webRouterNotification);
//#endregion

//#region Mobile-oriented end-points
app.use("/mobile/v1/notifications", mobileRouterNotification);
//#endregion

//#region Web-oriented end-points
app.use('/api/web/v1/users', webRouterUser);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/users", mobileRouterUser);
//#endregion

//#region Web-oriented end-points
app.use("/api/web/v1/third_parties", webRouterThird);
//#endregion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/third_parties", mobileRouterThird);
//#endregion


//#region upload end-points
app.use("/api/web/v1/file_management/upload", uploadRouter);
//#endregion

//#region Web-oriented end-points
app.use("/api/web/v1/admin", webAdminRouter);
app.use("/api/web/v1/admin/role", webRoleRouter);
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
