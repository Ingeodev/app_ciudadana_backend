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
const reportController = require("../controllers/webReports");
const mobileServiceController = require('../controllers/webMobileService');

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

// Edit an existing advertisement Category.
router.post('/advertisementCategory/edit', advertisementCategoryController.postEditCategory);

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

//#region Reports end-points
// Retrieve all the reports by user.
router.get('/security/reports', reportController.getListAllByUser);
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

//#region Mobile Services end-points
router.get(
  "/mobile_services/",
  mobileServiceController.listMobileServices
);
router.get(
  "/mobile_services/access",
  mobileServiceController.listMobileServiceTypes
);
router.post(
  "/mobile_services/",
  mobileServiceController.registerMobileService
);
router.post(
  "/mobile_services/edit",
  mobileServiceController.updateMobileService
);
router.post(
  "/mobile_services/status",
  mobileServiceController.changeStatusMobileService
);
router.post(
  "/mobile_services/delete",
  mobileServiceController.deleteMobileService
);
//#endregion

router.get("/", (req, res) => {
  res.status(200).json("Web API - Notificacions Microservice");
});

module.exports = router
