const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../../../middleware/authMiddleware.js");
const webBase = require("./webBase.js");
const webRoadState = require("./webRoadStates.js");
const webTrafficNotification = require("./webTrafficNotification.js");
router.use(authMiddleware);

router.use("", webBase);
router.use("/road_state", webRoadState);
router.use("/traffic_notification", webTrafficNotification);

module.exports = router;
