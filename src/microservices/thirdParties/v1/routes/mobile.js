const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const categoryController = require("../controllers/mobile/categories.js");
const companiesController = require("../controllers/mobile/companies.js");
const transportController = require("../controllers/mobile/transportRoutes.js");
const tourismCategoryController = require("../controllers/mobile/tourismCategories.js");

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

// --------------------- Tourism Categories ----------------------------
//#region Tourism categories end-points
router.get(
  "/tourism/categories",
  // hasPermissions({ role: "super_master_user" }),
  tourismCategoryController.getAll
);
//#endregion - Tourism categories

// --------------------- Companies ----------------------------
//#region companies end-points
router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  companiesController.getCompaniesnServices
);
//#endregion - companies

module.exports = router;
