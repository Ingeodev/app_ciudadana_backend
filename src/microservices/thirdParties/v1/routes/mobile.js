const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const categoryController = require("../controllers/mobile/categories.js");
const companiesController = require("../controllers/mobile/companies.js");
const transportController = require("../controllers/mobile/transportRoutes.js");

// --------------------- Intercity_transport ----------------------------
router.get(
  "/intercity_transport",
  // hasPermissions({ role: "super_master_user" }),
  transportController.getTransportRoutes
);

// --------------------- Categories ----------------------------
//#region categories end-points
router.get(
  "/categories",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getAll
);
//#endregion - categories

// --------------------- Companies ----------------------------
//#region companies end-points
router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  companiesController.getCompaniesnServices
);
//#endregion - companies

module.exports = router;
