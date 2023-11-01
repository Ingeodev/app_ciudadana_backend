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
app.use(cors());

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
