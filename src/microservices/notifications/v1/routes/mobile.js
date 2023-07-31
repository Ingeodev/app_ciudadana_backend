const express = require('express');
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");

const publicityController = require('../controllers/mobilePublicity.js');
const attentionLinesController = require('../controllers/mobileAttentionLines.js');

// TODO: require MOBILE authentication for every point

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


module.exports = router