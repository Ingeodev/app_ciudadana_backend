const express = require('express');
const router = express.Router();
const authorization = require("../../../../middleware/authMiddleware.js");

const publicityController = require('../controllers/mobilePublicity.js');
const attentionLinesController = require('../controllers/mobileAttentionLines.js');

// TODO: require MOBILE authentication for every point(CHECK hasPermissions)
router.use(authorization.authMiddleware);

//#region Publicity end-points
// Retrieve the advertisements that have no category attached.
router.get('/publicity/', publicityController.getUncategorized);

// Retrieve the advertisements with a category attached.
router.get('/publicity/banners', publicityController.getCategorized);
//#endregion

//#region Attention Lines end-points
router.get(
  "/attention_lines",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.getListAll
);

router.get(
  "/attention_lines/dependencies",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.getDependencies
);

router.post(
  "/attention_lines/pqrsdf",
  // hasPermissions({ role: "super_master_user" }),
  attentionLinesController.postPqrsdf
);
//#endregion

// ! Retornar lista de endpoints?
router.get("/", (req, res) => {
  res.status(200).json("Mobile API - Notifications Microservice");
});

module.exports = router