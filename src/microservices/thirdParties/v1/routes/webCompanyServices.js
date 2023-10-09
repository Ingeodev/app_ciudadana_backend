const express = require("express");
const router = express.Router();
const companyServicesController = require("../controllers/web/companyServices.js");

// * ------------------ Company Services -----------------------------

router.post(
  "",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.postServices
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.postEdit
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.postDelete
);

router.get(
  "/:id",
  // hasPermissions({ role: "super_master_user" }),
  companyServicesController.getServices
);
//#endregion - Company
module.exports = router;
