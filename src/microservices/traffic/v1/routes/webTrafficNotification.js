const express = require("express");
const router = express.Router();
const trafficNotificationCont = require("../controllers/web/trafficNotifications.js");

// ------------------ Traffic Notifications -----------------------------
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  trafficNotificationCont.postRegister
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  trafficNotificationCont.getOne
);
module.exports = router;
