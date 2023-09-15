const express = require("express");
const router = express.Router();
const dateTimetableController = require("../controllers/web/routeTimetables");


// * ------------------ Date of Routes Timetables -----------------------------
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  dateTimetableController.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  dateTimetableController.postEdit
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  dateTimetableController.postDelete
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  dateTimetableController.getAll
);
module.exports = router;
