const { Router } = require("express");
const router = Router();
const companyController = require("../controllers/web/companies.js");


// * ------------------ Company -----------------------------
//#region Company end-points
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postEdit
);

router.get(
  "/:id",
  // hasPermissions({ role: "super_master_user" }),
  companyController.getProfile
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  companyController.getAll
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  companyController.postDelete
);
module.exports = router;
