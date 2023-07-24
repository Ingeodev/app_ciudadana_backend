require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require('http-status-codes');

const advertisingRouter = require('./routes/advertisement');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use('/v1/notifications/advertising', advertisingRouter);

// Not found route!
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = StatusCodes.NOT_FOUND;
  return next(error);
});

// Error Handler!
app.use((error, req, res, next) => {
  if (!error.status) {
    console.error(error);
    error.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
  return res.status(error.status).json({
    error: {
      message: error.message
    }
  });
});

app.listen(3000, function () {
  console.log("running with port 3000");
});
