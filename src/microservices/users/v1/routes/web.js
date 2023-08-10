const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const usersWeb = require("../controllers/users/web.js");
const documentTypes = require("../controllers/documentTypes/web.js");

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
  usersWeb.postAccountFullLogin
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
  usersWeb.postAccountUpdateUser
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
  usersWeb.postUsersUpdateDelete
);

router.post(
  "/full_login",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersFullLogin
);


module.exports = router;
