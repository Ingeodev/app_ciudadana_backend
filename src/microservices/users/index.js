require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { authMiddleware }= require('../../middleware/authMiddleware.js');
const routes = require("./routes/routes.js");
const errorHandler = require("../../middleware/errorMiddleware.js");

const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use(authMiddleware);
app.use('/v1/users', routes);

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
