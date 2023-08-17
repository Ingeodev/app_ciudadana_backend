const express = require('express');
const router = express.Router();

const authorization = require("../../../../middleware/authMiddleware");
const advertisingController = require('../controllers/webAdvertisement');
const advertisementCategoryController = require('../controllers/webAdvertisementCategory');
const securityController = require("../controllers/webSecurity");
const securityCatController = require("../controllers/webSecurityCategories");
const attentionLinesController = require("../controllers/webAttentionLines");
const alertController = require('../controllers/webAlert');
const socialNetworkController = require('../controllers/webSocialNetwork');

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

//#region Advertisement Categories end-points
// Retrieve all the advertisement Categories.
router.get('/advertisementCategory', advertisementCategoryController.getAllCategories);

// Create a new advertisement Category.
router.post('/advertisementCategory', advertisementCategoryController.postCategory);

// Delete an advertisement Category.
router.post('/advertisementCategory/delete', advertisementCategoryController.postCategoryDelete);
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
  securityController.postEdit
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
  securityController.getSecurity
);
router.post(
  "/security_category/",
  // hasPermissions({ role: "super_master_user" }),
  securityCatController.postRegister
);

router.post(
  "/security_category/edit",
  // hasPermissions({ role: "super_master_user" }),
  securityCatController.postEdit
);

router.post(
  "/security_category/delete",
  // hasPermissions({ role: "super_master_user" }),
  securityCatController.postDelete
);

router.get(
  "/security_category",
  // hasPermissions({ role: "super_master_user" }),
  securityCatController.getAll
);

router.get(
  "/security_category/:id",
  // hasPermissions({ role: "super_master_user" }),
  securityCatController.getOneById
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

//#region AttentionLines end-points
router.post(
  "/attention_lines/",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postRegister
);
//#endregion

//#region Social Networks end-points
router.get(
  "/social_networks/",
  socialNetworkController.listSocialNetworks
);
router.get(
  "/social_networks/types",
  socialNetworkController.listSocialNetworkTypes
);
router.post(
  "/social_networks/",
  socialNetworkController.registerSocialNetwork
);
router.post(
  "/social_networks/edit",
  socialNetworkController.updateSocialNetwork
);
router.post(
  "/social_networks/status",
  socialNetworkController.changeStatusSocialNetwork
);
router.post(
  "/social_networks/delete",
  socialNetworkController.deleteSocialNetwork
);
//#endregion

router.get("/", (req, res) => {
  res.status(200).json("Web API - Notificacions Microservice");
});

module.exports = router
