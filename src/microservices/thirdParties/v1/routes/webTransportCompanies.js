const express = require("express");
const router = express.Router();
const { uploadSingleExcel } = require('../../../../middleware/uploadMiddleware');
const transportCompanyController = require("../controllers/web/transportCompanies.js");
const citiesController = require("../controllers/web/cities.js");

// ------------------ Transport Company -----------------------------
router.post(
  "/api_key",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postCreateApiKey
);

router.get(
  "/api_key/:companyId",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.getApiKey
);

router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postEdit
);

router.get(
  "/:id",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.getProfile
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.postDelete
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  transportCompanyController.getAll
);
module.exports = router;
