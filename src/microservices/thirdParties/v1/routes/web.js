const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/web/categories.js");
const companyController = require("../controllers/web/companies.js");

// * ------------------ Endpoints - appWeb -----------------------------
//#region Categories end-points
router.post(
  "/categories/",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postRegister
);

router.post(
  "/categories/edit",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postEdit
);

router.get(
  "/categories",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getAll
);

router.get(
  "/categories/:id",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getOneById
);
//#endregion - Categories

//#region Company end-points
router.post(
  "/company/",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postRegister
);

router.post(
  "/company/geocoding",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postGeocoding
);

// router.post(
//   "/company/edit",
//   // hasPermissions({ role: "super_master_user" }),
//   companyController.postEdit
// );

// router.get(
//   "/company/:id",
//   // hasPermissions({ role: "super_master_user" }),
//   companyController.getProfile
// );

// router.get(
//   "/company/delete",
//   // hasPermissions({ role: "super_master_user" }),
//   companyController.postDelete
// );
//#endregion - Company

module.exports = router;
