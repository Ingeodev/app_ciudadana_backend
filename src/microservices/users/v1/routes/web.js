const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const usersWeb = require("../controllers/web/users.js");
const adminNotif = require("../controllers/web/adminNotifications.js");
const adminController = require("../controllers/web/admins.js");
const documentTypes = require("../controllers/web/documentTypes.js");

// * ------------------ Endpoints - appWeb -----------------------------
// TODO: -- Start - Endpoints copied from mobileController
router.post(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postAccountInfo
);

router.post(
  "/account/full_login",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postAccountBaseLogin
);

router.get(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.getAccountInfo
);

router.get(
  "/account/login/phase",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.getAccountLoginPhase
);

router.post(
  "/account/edit",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postAccountFullLogin
);
// TODO: -- End - Endpoints copied from mobileController

// TODO: -- Start - DocumentTypes Endpoints
//#region DocumentTypes end-points
router.post(
  "/document_types/",
  // hasPermissions({ role: "super_master_user" }),
  documentTypes.postRegister
);

router.post(
  "/document_types/edit",
  // hasPermissions({ role: "super_master_user" }),
  documentTypes.postEdit
);

router.post(
  "/document_types/status",
  // hasPermissions({ role: "super_master_user" }),
  documentTypes.postStatus
);

router.get(
  "/document_types",
  // hasPermissions({ role: "super_master_user" }),
  documentTypes.getAll
);

router.get(
  "/document_types/:id",
  // hasPermissions({ role: "super_master_user" }),
  documentTypes.getOneById
);
//#endregion - DocumentTypes
// TODO: -- End - DocumentTypes Endpoints 

router.get(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.getUsersListAll
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersDelete
);

router.post(
  "/status",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersStatus
);

router.post(
  "/full_login",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersFullLogin
);

// TODO: -- Start - Admin Endpoints
//#region Admin end-points
 router.get(
  "/admins/notifications",
   // hasPermissions({ role: "super_master_user" }),
   adminNotif.getAllNotifications
 );

router.post(
  "/admins/",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postRegister
);

router.post(
  "/admins/role/",
  // hasPermissions({ role: "super_master_user" }),
  adminController.postAddRole
);

// ! Pendiente: Diferenciar el usuario admin por rol
// router.post(
//   "/admins/delete",
//   // hasPermissions({ role: "super_master_user" }),
//   adminController.postDelete
// );

// ! Pendiente: Diferenciar el usuario admin por rol
// router.get(
//   "/admins",
//   // hasPermissions({ role: "super_master_user" }),
//   adminController.getAll
// );

router.get(
  "/admins/:id",
  // hasPermissions({ role: "super_master_user" }),
  adminController.getOneById
);
//#endregion - Admin
// TODO: -- End - Admin Endpoints

module.exports = router;
