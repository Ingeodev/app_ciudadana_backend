const express = require("express");
const router = express.Router();
const { hasPermissions, authMiddleware } = require("../../../../middleware/authMiddleware.js");
const usersWeb = require("../controllers/web/users.js");
const documentTypes = require("../controllers/web/documentTypes.js");
const baseController = require("../controllers/web/base.js");
router.use(authMiddleware);

router.post(
  "/validate_lat_lon",
  // hasPermissions({ role: "super_master_user" }),
  baseController.postValidateLatLon
);

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

// router.post(
//   "/document_types/status",
//   // hasPermissions({ role: "super_master_user" }),
//   documentTypes.postStatus
// );

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
  usersWeb.getUsersListByDevice
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

router.post(
  "/base_login",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersBaseLogin
);

module.exports = router;
