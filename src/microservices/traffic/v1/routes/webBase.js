const express = require("express");
const router = express.Router();
const baseController = require("../controllers/web/base.js");

//#region Categories end-points
router.post(
  "/validate_lat_lon",
  // hasPermissions({ role: "super_master_user" }),
  baseController.postValidateLatLon
);

module.exports = router;
