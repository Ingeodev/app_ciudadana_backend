const express = require("express");
const router = express.Router();

const controller = require("../controllers/web/tourismCategories");

// * ------------------ Categories -----------------------------
//#region Categories end-points
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  controller.postCreate
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  controller.postUpdate
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  controller.getAll
);

// router.get(
//   "/:id",
//   // hasPermissions({ role: "super_master_user" }),
//   controller.getOneById
// );

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  controller.postDelete
);

module.exports = router;
