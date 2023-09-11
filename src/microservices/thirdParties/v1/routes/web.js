const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/web/categories.js");
const companyController = require("../controllers/web/companies.js");
const transportCompanyController = require("../controllers/web/transportCompanies.js");
const companyServicesController = require("../controllers/web/companyServices.js");
const transpRoutesController = require("../controllers/web/transportRoutes.js");
const citiesController = require("../controllers/web/cities.js");

// * ------------------ Categories -----------------------------
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
router.post(
  "/categories/delete",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postDelete
);
//#endregion - Categories

// * ------------------ Company -----------------------------
//#region Company end-points
router.post(
  "/company/",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postRegister
);

router.post(
  "/company/edit",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postEdit
);

router.get(
  "/company/:id",
  // hasPermissions({ role: "super_master_user" }),
  companyController.getProfile
);

router.get(
  "/company/",
  // hasPermissions({ role: "super_master_user" }),
  companyController.getAll
);

router.post(
  "/company/delete",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postDelete
);

// * ------------------ Company Services -----------------------------
router.get(
  "/company_service/:id",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.getServices
);

router.post(
  "/company_service",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.postServices
);

router.post(
  "/company_service/edit",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.postEdit
);

router.post(
  "/company_service/delete",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.postDelete
);
//#endregion - Company

// * ------------------ Transport Company -----------------------------
router.post(
  "/transport_company/",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postRegister
);

router.post(
  "/transport_company/edit",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postEdit
);

router.get(
  "/transport_company/:id",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.getProfile
);

router.post(
  "/transport_company/delete",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postDelete
);

router.get(
  "/transport_company/",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.getAll
);

// * ------------------ Company Routes -----------------------------
router.post(
  "/transport_company/route",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postRegister
);

router.get(
  "/transport_company/route",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getAll
);

router.post(
  "/transport_company/route/edit",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postEdit
);

router.post(
  "/transport_company/route/delete",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postDelete
);
  //#endregion - Company
  
  router.get(
    "/transport_company/route/companies",
    // hasPermissions({ role: "super_master_user" }),
    transpRoutesController.getCompaniesNRoutes
);
  
router.get(
  "/transport_company/route/excel",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postUploadXlsxRoutes
);
  // * ------------------ cities -----------------------------
  router.post(
    "/city/",
    // hasPermissions({ role: "super_master_user" }),
  citiesController.postRegister
);

router.get(
  "/city/",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.getAll
);

router.post(
  "/city/edit",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.postEdit
);

router.post(
  "/city/delete",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.postDelete
);
// #endregion - Company
module.exports = router;
