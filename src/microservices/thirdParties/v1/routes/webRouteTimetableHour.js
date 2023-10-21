const { Router } = require("express");
const router = Router();
const hourTimetableController = require("../controllers/web/routeTimetablesHourTariff");

// * ------------------ Hour n Tariff of Routes Timetables -----------------------------
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  hourTimetableController.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  hourTimetableController.postEdit
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  hourTimetableController.postDelete
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  hourTimetableController.getAll
);
module.exports = router;
