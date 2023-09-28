const express = require("express");
const router = express.Router();
const tourimsCompanyCont = require("../controllers/web/tourismCompanies.js");

// ------------------ Transport Company -----------------------------
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

// router.get(
//   "/:id",
//   // hasPermissions({ role: "super_master_user" }),
//   tourimsCompanyCont.getProfile
// );

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
