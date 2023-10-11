const express = require('express');
const router = express.Router();

const authorization = require("../../../../middleware/authMiddleware");
const { uploadSingleExcel } = require('../../../../middleware/uploadMiddleware');

const advertisingController = require('../controllers/webAdvertisement');
const securityController = require("../controllers/webSecurity");
const securityCatController = require("../controllers/webSecurityCategories");
const attentionLinesController = require("../controllers/webAttentionLines");
const alertController = require('../controllers/webAlert');
const socialNetworkController = require('../controllers/webSocialNetwork');
const reportController = require("../controllers/webReports");
const reportConfigCont = require("../controllers/webReportConfigurations.js");
const dependenciesController = require("../controllers/webDependencies");
const mobileServiceController = require("../controllers/webMobileService");
const genderCategoryC = require("../controllers/webGenderCategories");
const genderAttLineC = require("../controllers/webGenderAttentionLines");
const securityAttentionPointsController = require("../controllers/webSecurityAttentionPoint");
const genderAttPointC = require("../controllers/webGenderAttentionPoint");
const baseController = require("../controllers/webBase.js");

// TODO: require WEB authentication for every point (CHECK hasPermissions)
router.use(authorization.authMiddleware);

router.post(
  "/validate_lat_lon",
  // hasPermissions({ role: "super_master_user" }),
  baseController.postValidateLatLon
);

//#region Advertisements end-points
// Retrieve all the advertisements whether they have a category or not.
router.get('/informationmb', advertisingController.getAllAdvertisements);

// Create a new advertisement.
router.post('/informationmb', advertisingController.postAdvertisement);

// Update an advertisement.
router.post('/informationmb/edit', advertisingController.postAdvertisementEdit);

// Update the status of an advertisement.
router.post('/informationmb/status', advertisingController.postAdvertisementStatus);

// Delete an advertisement.
router.post('/informationmb/delete', advertisingController.postAdvertisementDelete);
//#endregion

//#region Security Attention Point end-points
// Retrieve all the Security Attention Points.
router.get('/security/attentionPoint', securityAttentionPointsController.getAllSecurityAttentionPoints);

// Retrieve one the Security Attention Point by ID.
router.get('/security/attentionPoint/:id', securityAttentionPointsController.getOneSecurityAttentionPoint);

// Create a new Security Attention Point.
router.post('/security/attentionPoint', securityAttentionPointsController.postCreateSecurityAttentionPoint);

// Edit an existing Security Attention Point.
router.post('/security/attentionPoint/edit', securityAttentionPointsController.postEditSecurityAttentionPoint);

// Delete a Security Attention Point.
router.post('/security/attentionPoint/delete', securityAttentionPointsController.postDeleteSecurityAttentionPoint);
//#endregion

//#region Reports end-points
// Retrieve all the reports by user.
router.get('/security/reports', reportController.getListAll);
//#endregion

//#region Report Configurations end-points
router.post(
  "/security/report_configuration",
  // hasPermissions({ role: "super_master_user" }),
  reportConfigCont.postRegister
);

router.get(
  "/security/report_configuration",
  // hasPermissions({ role: "super_master_user" }),
  reportConfigCont.getReportConfig
);
//#endRegion

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

//#region Gender Attention Lines end-points
router.post(
  "/gender_line/",
  // hasPermissions({ role: "super_master_user" }),
  genderAttLineC.postRegister
);

router.post(
  "/gender_line/edit",
  // hasPermissions({ role: "super_master_user" }),
  genderAttLineC.postEdit
);

router.post(
  "/gender_line/delete",
  // hasPermissions({ role: "super_master_user" }),
  genderAttLineC.postDelete
);

router.get(
  "/gender_line",
  // hasPermissions({ role: "super_master_user" }),
  genderAttLineC.getListAll
);

router.post(
  "/gender_category/",
  // hasPermissions({ role: "super_master_user" }),
  genderCategoryC.postRegister
);

router.post(
  "/gender_category/edit",
  // hasPermissions({ role: "super_master_user" }),
  genderCategoryC.postEdit
);

router.post(
  "/gender_category/delete",
  // hasPermissions({ role: "super_master_user" }),
  genderCategoryC.postDelete
);

router.get(
  "/gender_category",
  // hasPermissions({ role: "super_master_user" }),
  genderCategoryC.getAll
);
//#endregion - Gender Attention Lines

//#region Gender Attention Points end-points
router.post(
  "/gender_point/",
  // hasPermissions({ role: "super_master_user" }),
  genderAttPointC.postRegister
);

router.post(
  "/gender_point/edit",
  // hasPermissions({ role: "super_master_user" }),
  genderAttPointC.postEdit
);

router.post(
  "/gender_point/delete",
  // hasPermissions({ role: "super_master_user" }),
  genderAttPointC.postDelete
);

router.get(
  "/gender_point",
  // hasPermissions({ role: "super_master_user" }),
  genderAttPointC.getListAll
);
//#endregion - Gender Attention Points

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

//#region Dependencies end-points
// List All dependencies (WEB).
router.get('/dependencies', dependenciesController.getAllDependencies);

// Get dependencies excel template (WEB).
router.get('/dependencies/template', dependenciesController.getDownloadXlsxTemplate);

// Get dependencies excel list (WEB).
router.get('/dependencies/excel', dependenciesController.getDownloadXlsxDependencies);

// Upload excel file with dependencies.
router.post('/dependencies/excel',
  uploadSingleExcel.single('file'),
  dependenciesController.postUploadXlsxDependencies);
//#endregion

router.get("/", (req, res) => {
  res.status(200).json("Web API - Notificacions Microservice");
});

module.exports = router
