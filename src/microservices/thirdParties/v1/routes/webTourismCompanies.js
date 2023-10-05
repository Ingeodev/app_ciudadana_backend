const express = require("express");
const router = express.Router();
const tourimsCompanyCont = require("../controllers/web/tourismCompanies.js");

// ------------------ Tourism Company -----------------------------
router.post(
  "/api_key",
  // hasPermissions({ role: "super_master_user" }),
  tourimsCompanyCont.postCreateApiKey
);

router.get(
  "/api_key/:companyId",
  // hasPermissions({ role: "super_master_user" }),
  tourimsCompanyCont.getApiKey
);

router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  tourimsCompanyCont.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  tourimsCompanyCont.postEdit
);

 router.get(
   "/:id",
   // hasPermissions({ role: "super_master_user" }),
   tourimsCompanyCont.getProfile
 );

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  tourimsCompanyCont.postDelete
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  tourimsCompanyCont.getAll
);
module.exports = router;
