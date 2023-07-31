const express = require('express');
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");

const advertisingController = require('../controllers/webAdvertisement');
const attentionLinesController = require('../controllers/webAttentionLines');
const alertController = require('../controllers/webAlert');

// TODO: require WEB authentication for every point

//#region Advertisements end-points
// Retrieve all the advertisements whether they have a category or not.
router.get('/advertising', advertisingController.getAllAdvertisements);

// Create a new advertisement.
router.post('/advertising', advertisingController.postAdvertisement);
//#endregion

//#region Attention Lines end-points
router.post(
  "/attention_lines/register",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postRegister
);

router.post(
  "/attention_lines/update",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postUpdate
);

router.post(
  "/attention_lines/update_active",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postUpdateActive
);

// ! Validar si es POST
router.post(
  "/attention_lines/find_all",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postListAll
);

router.get(
  "/attention_lines/find_one/:id",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.getAttentionLine
);
//#endregion

//#region Alerts end-points
router.post('/alert', alertController.sendAlerts);
//#endregion

module.exports = router