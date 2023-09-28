const express = require("express");
const router = express.Router();
const tourismServCont = require("../controllers/web/tourismServices.js");

// * ------------------ Company Services -----------------------------
router.get(
  "/:id",
  // hasPermissions({ role: "super_master_user" }),
  tourismServCont.getServices
);

router.post(
  "",
  // hasPermissions({ role: "super_master_user" }),
  tourismServCont.postServices
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  tourismServCont.postEdit
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  tourismServCont.postDelete
);
//#endregion - Company
module.exports = router;
