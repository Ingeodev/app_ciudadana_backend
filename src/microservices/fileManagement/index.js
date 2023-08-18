require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require("http-status-codes");

const errorHandler = require("../../middleware/errorMiddleware.js");

const uploadRouter = require("./v1/routes/upload.js");
const downloadRouter = require("./v1/routes/download.js");

const app = express();

// Set port
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

//#region download end-points
app.use("/api/v1/file_management/download", downloadRouter);
//#endregion

//#region upload end-points
app.use("/api/web/v1/file_management/upload", uploadRouter);
//#endregion

// Not found route
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = StatusCodes.NOT_FOUND;
  return next(error);
});

app.use(errorHandler);

app.listen(PORT, function () {
  console.log(`running in port ${PORT}`);
});
