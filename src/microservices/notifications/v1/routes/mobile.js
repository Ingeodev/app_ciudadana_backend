const express = require('express');
const router = express.Router();
const Busboy = require('busboy');

const { authMiddlewareMobile } = require("../../../../middleware/authMiddleware");
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
const { uploadSingleImage, uploadSinglePqrsFile } = require("../../../../middleware/uploadMiddleware.js");
const uploadController = require("../../../fileManagement/v1/controllers/upload.js");

const parseReportField = (req, res, next) => {
  if (!req.rawBody) {
    return next(Object.assign(new Error("rawBody not available"), { status: 500 }));
  }
  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  busboy.on("field", (name, value) => { fields[name] = value; });
  busboy.on("close", () => { req.body = fields; next(); });
  busboy.end(req.rawBody);
};

// TODO: require MOBILE authentication for every point(CHECK hasPermissions)
//router.use(authMiddlewareMobile);

//#region Publicity end-points
// Retrieve the advertisements that have no category attached.
router.get('/publicity/', publicityController.getUncategorized);

// Retrieve the advertisements with a category attached.
router.get('/publicity/banners', publicityController.getCategorized);
//#endRegion

//#region Dependencies end-points
// Retrieve up to 500 dependencies.
router.get(
  "/attention_lines/dependencies",        // This link style is due to the Swagger (2023-08-31)
  // hasPermissions({ role: "super_master_user" }),
  dependenciesController.getDependencies
);
//#endRegion

//#region PQRSDF end-points
// Upload the attachment (jpg, jpeg, png or pdf) for a PQRS request.
router.post(
  "/attention_lines/pqrsdf/upload-file",
  uploadSinglePqrsFile,
  uploadController.postSingleFile,
);

// Register a PQRS request. Multipart body: field 'pqrs' (JSON string) with the request data.
router.post(
  "/attention_lines/pqrsdf",
  parseReportField,
  attentionController.postPqrsdf
);

// List the PQRS requests of the authenticated user with pagination and filters (radicado, status).
router.get(
  "/attention_lines/pqrsdf",
  authMiddlewareMobile,
  attentionController.getPqrsdf
);
//#endRegion

//#region Security end-points
router.get(
  "/security",
  // hasPermissions({ role: "super_master_user" }),
  securityController.getListAll
);
//#endRegion

//#region Reports end-points
router.post(
  "/security/reports/upload-image",
  authMiddlewareMobile,
  uploadSingleImage,
  uploadController.postSingleFile,
);

router.post(
  "/security/reports",
  authMiddlewareMobile,
  parseReportField,
  reportController.postRegister
);

router.get(
  "/security/reports",
  // hasPermissions({ role: "super_master_user" }),
  reportController.getListAllClosest
);
//#endRegion

//#region Security Attention Point end-points
// Retrieve all the Security Attention Points.
router.get('/security/attention_points',
  // hasPermissions({ role: "super_master_user" }),
  securityAttentionPointsController.getSecurityAttentionPoints);
//#endRegion

//#region AttentionLines end-points
router.get(
  "/attention_lines/",
  // hasPermissions({ role: "super_master_user" }),
  attentionController.getAttentionLine
);
//#endRegion

//#region Alerts (Notifications in swagger) end-points
router.post('/notifications/register', authMiddlewareMobile, alertController.registerPush);
router.get('/notifications/', alertController.getListActive);
//#endRegion

//#region AttentionLines end-points
router.get(
  "/social_networks/",
  socialNetworkController.getSocialNetworks
);
//#endRegion

//#region gender end-points
router.get(
  "/gender/attention_points",
  // hasPermissions({ role: "super_master_user" }),
  genderController.getAttentionPoints
);
router.get(
  "/gender",
  // hasPermissions({ role: "super_master_user" }),
  genderController.getCategoriesnAttentionLines
);
//#endRegion


router.get('/services/', mobileServiceController.getMobileServices);

module.exports = router
