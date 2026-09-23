const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const { uploadSinglePqrsFile } = require("../../../../middleware/uploadMiddleware.js");
const adminNotif = require("../controllers/webAdminNotifications.js");
const adminController = require("../controllers/webAdmin.js");

// TODO: -- Start - Admin Endpoints
//#region Admin end-points
router.get(
  "/notifications",
  // hasPermissions({ role: "super_master_user" }),
  adminNotif.getAllNotifications
);

//#region PQRS end-points
// List all the PQRS requests with pagination and filters.
router.get(
  "/pqrs",
  // hasPermissions({ role: "super_master_user" }),
  adminController.getListAllPqrs
);

// Get one PQRS with its statuses and responses.
router.get(
  "/pqrs/:id",
  // hasPermissions({ role: "super_master_user" }),
  adminController.getOnePqrs
);

// Register a response for a PQRS request. Multipart body: field 'file' (attachment) and field 'pqrs' (JSON string).
router.post(
  "/pqrs/respond",
  uploadSinglePqrsFile,
  adminController.postPqrsResponse
);
//#endregion - PQRS

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

router.post(
  "/edit/mobile_user",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postEditMobileUser
);

// ! Pendiente: Diferenciar el usuario admin por rol
router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postDelete
);

// router.get(
//   "/",
//   // hasPermissions({ role: "super_master_user" }),
//   adminController.getAll
// );

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
