const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../middleware/authMiddleware.js");
const usersMobile = require("../controllers/usersAppMobile.js");
const usersWeb = require("../controllers/usersAppWeb.js");

// * ------------------ Endpoints - appMobile -----------------------------
router.post(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.postAccountInfo
);

router.post(
  "/account/full_login",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.postAccountFullLogin
);

router.get(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.getAccountInfo
);

router.get(
  "/account/login/phase",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.getAccountLoginPhase
);

router.post(
  "/account/updateUser",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.postAccountUpdateUser
);

// * ------------------ Endpoints - appWeb -----------------------------
router.get(
  "/web/list_all_active",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.getUsersListAllActive
);

router.post(
  "/web/update_disabled",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersUpdateDisabled
);

router.post(
  "/web/update_loginPhase_fullLogin",
  // hasPermissions({ role: "super_master_user" }),
  usersWeb.postUsersUpdateLoginPhaseFullLogin
);

// ! Retornar lista de endpoints?
router.get("/", (req, res) => {
  res.status(200).json("API Users Microservice");
});


module.exports = router;
