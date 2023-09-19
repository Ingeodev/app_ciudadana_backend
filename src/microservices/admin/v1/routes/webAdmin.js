const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const adminNotif = require("../controllers/webAdminNotifications.js");
const adminController = require("../controllers/webAdmin.js");

// TODO: -- Start - Admin Endpoints
//#region Admin end-points
router.get(
  "/notifications",
  // hasPermissions({ role: "super_master_user" }),
  adminNotif.getAllNotifications
);

router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postRegister
);

router.post(
  "/add_role/",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postAddRole
);

router.post(
  "/edit/",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postEdit
);

// ! Pendiente: Diferenciar el usuario admin por rol
router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postDelete
);

// ! Pendiente: Diferenciar el usuario admin por rol
router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  adminController.getAll
);

router.get(
  "/:id",
  // hasPermissions({ role: "super_master_user" }),
  adminController.getOneById
);

router.post(
  "/set_passwd",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postSetPasswd
);
//#endregion - Admin
// TODO: -- End - Admin Endpoints

module.exports = router;
