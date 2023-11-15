const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../../../middleware/authMiddleware.js");
const webBase = require("./webBase.js");
const webRoadState = require("./webRoadStates.js");
const webTrafficNotification = require("./webTrafficNotification.js");
const webBicyclesTermsConditions = require("./webBicyclesTermsConditions.js");
router.use(authMiddleware);

router.use("", webBase);
router.use("/road_state", webRoadState);
router.use("/traffic_notification", webTrafficNotification);
router.use("/bikes/terms_conditions", webBicyclesTermsConditions);

module.exports = router;
