const express = require('express');
const router = express.Router();

const authorization = require("../../../../middleware/authMiddleware");
const publicityController = require('../controllers/mobilePublicity');
const securityController = require("../controllers/mobileSecurity");
const attentionController = require("../controllers/mobileAttentionLines");
const alertController = require("../controllers/mobileAlert");
const socialNetworkController = require("../controllers/mobileSocialNetwork");
const reportController = require("../controllers/mobileReports");
const mobileServiceController = require("../controllers/mobileMobileService");
const dependenciesController = require("../controllers/mobileDependencies");
const genderController = require("../controllers/mobileGender");
const securityAttentionPointsController = require("../controllers/mobileSecurityAttentionPoint");
const { uploadImagesPdfs } = require("../../../../middleware/uploadMiddleware.js");

// TODO: require MOBILE authentication for every point(CHECK hasPermissions)
router.use(authorization.authMiddleware);

//#region Publicity end-points
// Retrieve the advertisements that have no category attached.
router.get('/publicity/', publicityController.getUncategorized);

// Retrieve the advertisements with a category attached.
router.get('/publicity/banners', publicityController.getCategorized);
//#endregion

//#region Dependencies end-points
// Retrieve up to 500 dependencies.
router.get(
  "/attention_lines/dependencies",        // This link style is due to the Swagger (2023-08-31)
  // hasPermissions({ role: "super_master_user" }),
  dependenciesController.getDependencies
);
//#endregion

// router.post(
//   "/attention_lines/pqrsdf",
//   // hasPermissions({ role: "super_master_user" }),
//   attentionController.postPqrsdf
// );
//#endregion

//#region Security end-points
router.get(
  "/security",
  // hasPermissions({ role: "super_master_user" }),
  securityController.getListAll
);
//#endregion

//#region Reports end-points
router.post(
  "/security/reports",
  // hasPermissions({ role: "super_master_user" }),
  uploadImagesPdfs.single("image"),
  reportController.postRegister
);

router.get(
  "/security/reports",
  // hasPermissions({ role: "super_master_user" }),
  reportController.getListAllClosest
);
//#endregion

//#region Security Attention Point end-points
// Retrieve all the Security Attention Points.
router.get('/security/attention_points',
  // hasPermissions({ role: "super_master_user" }),
  securityAttentionPointsController.getSecurityAttentionPoints);
//#endregion

//#region AttentionLines end-points
router.get(
  "/attention_lines/",
  // hasPermissions({ role: "super_master_user" }),
  attentionController.getAttentionLine
);
//#endregion

//#region Alerts (Notifications in swagger) end-points
router.post('/notifications/register', alertController.registerPush);
router.get('/notifications/', alertController.getListActive);
//#endregion

//#region AttentionLines end-points
router.get(
  "/social_networks/",
  socialNetworkController.getSocialNetworks
);
//#endregion

//#region gender end-points
router.get(
  "/gender/attention_points",
  // hasPermissions({ role: "super_master_user" }),
  genderController.getAttentionPoins
);
router.get(
  "/gender",
  // hasPermissions({ role: "super_master_user" }),
  genderController.getCategoriesnAttentionLines
);
//#endregion


router.get('/services/', mobileServiceController.getMobileServices);

module.exports = router
