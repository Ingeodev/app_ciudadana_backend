require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require("http-status-codes");
const { authMiddleware } = require('../../middleware/authMiddleware.js');
const mobileRouter = require("./v1/routes/mobile.js");
const webBase = require("./v1/routes/webBase.js");
const webRoadState = require("./v1/routes/webRoadStates.js");
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
app.use("/api/web/v1/traffic", webBase);
app.use("/api/web/v1/traffic/road_state", webRoadState);
//#endRegion

//#region Mobile-oriented end-points
app.use("/api/mobile/v1/traffic", mobileRouter);
//#endRegion

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
