const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const categoryController = require("../controllers/mobile/categories.js");
const companiesController = require("../controllers/mobile/companies.js");

// TODO: -- Start - categories Endpoints
//#region categories end-points
router.get(
  "/categories",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getAll
);
//#endregion - categories
// TODO: -- End - categories Endpoints

// TODO: -- Start - companies Endpoints
//#region companies end-points
router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  companiesController.getCompaniesnServices
);
//#endregion - companies
// TODO: -- End - companies Endpoints 

module.exports = router;
