require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {authMiddleware, hasPermissions }= require('./services/auth-middleware');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(authMiddleware);
app.get("/products", hasPermissions({ role: 'super_master'}), function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.listen(3000, function () {
  console.log("running with port 3000");
});
