const express = require("express");
const router = express.Router();
const { uploadSingleExcel } = require('../../../../middleware/uploadMiddleware');
const citiesController = require("../controllers/web/cities.js");

// * ------------------ cities -----------------------------
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.postRegister
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.getAll
);

router.get(
  "/autocomplete",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.getAutocomplete
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.postEdit
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  citiesController.postDelete
);

router.post(
  "/excel",
  // hasPermissions({ role: "super_master_user" }),
  uploadSingleExcel.single("file"),
  citiesController.postUploadXlsx
);
// #endregion - Company
module.exports = router;
