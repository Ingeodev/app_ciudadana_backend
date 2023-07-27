require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StatusCodes } = require('http-status-codes');

const errorHandler = require('../../middleware/errorMiddleware');
const advertisingRouter = require("./routes/advertisement");
const publicityRouter = require("./routes/publicity");
const attentionLinesAppMobileRouter = require("./routes/serviceHotlinesAppMobile");
const attentionLinesAppWebRouter = require("./routes/serviceHotlinesAppWeb");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

//#region Web-oriented end-points
app.use('/v1/notifications/advertising', advertisingRouter);
app.use("/v1/attention_lines/mobile/", attentionLinesAppWebRouter);
//#endregion

//#region Mobile-oriented end-points
app.use("/v1/notifications/publicity", publicityRouter);
app.use("/v1/attention_lines/web/", attentionLinesAppMobileRouter);
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
