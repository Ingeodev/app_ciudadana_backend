const express = require('express');
const router = express.Router();
const authorization = require("../../../../middleware/authMiddleware.js");

const advertisingController = require('../controllers/webAdvertisement');
const securityController = require("../controllers/webSecurity");
const attentionLinesController = require("../controllers/webAttentionLines");
const alertController = require('../controllers/webAlert');

// TODO: require WEB authentication for every point (CHECK hasPermissions)
router.use(authorization.authMiddleware);

//#region Advertisements end-points
// Retrieve all the advertisements whether they have a category or not.
router.get('/advertising', advertisingController.getAllAdvertisements);

// Create a new advertisement.
router.post('/advertising', advertisingController.postAdvertisement);

// Update an advertisement.
router.post('/advertising/edit', advertisingController.postAdvertisementEdit);

// Update the status of an advertisement.
router.post('/advertising/status', advertisingController.postAdvertisementStatus);

// Delete an advertisement.
router.post('/advertising/delete', advertisingController.postAdvertisementDelete);
//#endregion

//#region Security end-points
router.post(
  "/security/",
  // hasPermissions({ role: "super_master_user" }),
  securityController.postRegister
);

router.post(
  "/security/edit",
  // hasPermissions({ role: "super_master_user" }),
  securityController.postUpdate
);

router.post(
  "/security/delete",
  // hasPermissions({ role: "super_master_user" }),
  securityController.postDelete
);

router.get(
  "/security",
  // hasPermissions({ role: "super_master_user" }),
  securityController.getListAll
);

router.get(
  "/security/:id",
  // hasPermissions({ role: "super_master_user" }),
  securityController.getAttentionLine
);
//#endregion

//#region Alerts end-points
router.post('/alert', alertController.sendAlerts);

router.get(
  "/alert",
  // hasPermissions({ role: "super_master_user" }),
  alertController.getlistAll
);
//#endregion

//#region Security end-points
router.post(
  "/attention_lines/",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postRegister
);
//#endregion

router.get("/", (req, res) => {
  res.status(200).json("Web API - Notificacions Microservice");
});

module.exports = router
