const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const usersWeb = require("../controllers/webUsers.js");

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
  "/account/updateUser",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postAccountUpdateUser
);
// TODO: -- End - Endpoints copied from mobileController

router.post(
  "/list_all",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersListAll
);

router.post(
  "/update_disabled",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersUpdateDisabled
);

router.post(
  "/update_loginPhase_fullLogin",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersUpdateLoginPhaseFullLogin
);

// ! Retornar lista de endpoints?
router.get("/", (req, res) => {
  res.status(200).json("Web API - User Microservice");
});

module.exports = router;
