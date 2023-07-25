require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { authMiddleware }= require('../../middleware/authMiddleware.js');
const routes = require("./routes/routes.js");

const app = express();

app.use(bodyParser.json({ limit: "60mb" }));
app.use(bodyParser.urlencoded({ limit: "60mb", extended: true }));
app.use(cors());

app.get("/health", function (req, res) {
  res.json({ msg: "everything seems to be ok" });
});

app.use(authMiddleware);

app.use('/v1/users', routes);

app.listen(3000, function () {
  console.log("running with port 3000");
});
