const express = require('express');
const router = express.Router();
const authorization = require("../../../../middleware/authMiddleware.js");

const publicityController = require('../controllers/mobilePublicity.js');
const securityController = require('../controllers/mobileSecurity.js');

// TODO: require MOBILE authentication for every point(CHECK hasPermissions)
router.use(authorization.authMiddleware);

//#region Publicity end-points
// Retrieve the advertisements that have no category attached.
router.get('/publicity/', publicityController.getUncategorized);

// Retrieve the advertisements with a category attached.
router.get('/publicity/banners', publicityController.getCategorized);
//#endregion

//#region Security end-points
router.get(
  "/security",
  // hasPermissions({ role: "super_master_user" }),
  securityController.getListAll
);

router.get(
  "/security/dependencies",
  // hasPermissions({ role: "super_master_user" }),
  securityController.getDependencies
);

router.post(
  "/security/pqrsdf",
  // hasPermissions({ role: "super_master_user" }),
  securityController.postPqrsdf
);
//#endregion

router.get("/", (req, res) => {
  res.status(200).json("Mobile API - Notifications Microservice");
});

module.exports = router