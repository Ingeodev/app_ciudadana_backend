const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const categoryController = require("../controllers/web/categories.js");

// * ------------------ Endpoints - appWeb -----------------------------
// TODO: -- Start - DocumentTypes Endpoints
//#region DocumentTypes end-points
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

router.post(
  "/categories/status",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.postStatus
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
//#endregion - DocumentTypes
// TODO: -- End - DocumentTypes Endpoints 

module.exports = router;
