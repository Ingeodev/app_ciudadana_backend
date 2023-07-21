require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/health", function(req, res ) {
  res.json({ msg: "everything seems to be ok" });
});

app.use('/v1/notifications', routes);
app.listen(3000, function () {
  console.log("running with port 3000");
});
