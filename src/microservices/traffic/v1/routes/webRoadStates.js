const express = require("express");
const router = express.Router();
const roadStateCont = require("../controllers/web/roadStates.js");

// ------------------ Road State -----------------------------
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  roadStateCont.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  roadStateCont.postEdit
);

 router.get(
   "/:id",
   // hasPermissions({ role: "super_master_user" }),
   roadStateCont.getOne
 );

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  roadStateCont.postDelete
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  roadStateCont.getAll
);
module.exports = router;
