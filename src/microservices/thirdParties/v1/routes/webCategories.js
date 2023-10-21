const { Router } = require("express");
const router = Router();
const categoryController = require("../controllers/web/categories.js");

// * ------------------ Categories -----------------------------
//#region Categories end-points
router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postEdit
);

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getAll
);

router.get(
  "/:id",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getOneById
);
router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postDelete
);
module.exports = router;
