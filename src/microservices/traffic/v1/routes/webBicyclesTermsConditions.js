const express = require("express");
const router = express.Router();
const bicyclesCont = require("../controllers/web/bicyclesTermsConditions.js");

// ------------------ Road State -----------------------------
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  bicyclesCont.postRegister
);

 router.get(
   "/",
   // hasPermissions({ role: "super_master_user" }),
   bicyclesCont.getTermsConditions
 );
module.exports = router;
