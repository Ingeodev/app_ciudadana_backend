require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {authMiddleware, hasPermissions }= require('./services/auth-middleware');
const db = require("./models/index.js");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(authMiddleware);

db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.get("/products", hasPermissions({ role: 'super_master'}), function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

require("./routes/user.route.js")(app);

app.listen(3000, function () {
  console.log("running with port 3000");
});
