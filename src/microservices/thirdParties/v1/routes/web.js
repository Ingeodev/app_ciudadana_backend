const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/web/categories.js");

// * ------------------ Endpoints - appWeb -----------------------------
//#region Categories end-points
router.post(
  "/categories/",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postRegister
);

router.post(
  "/categories/edit",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postEdit
);

router.get(
  "/categories",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getAll
);

router.get(
  "/categories/:id",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getOneById
);
//#endregion - Categories

module.exports = router;
