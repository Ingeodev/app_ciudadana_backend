const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const usersMobile = require("../controllers/mobileUsers.js");

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

// ! Retornar lista de endpoints?
router.get("/", (req, res) => {
  res.status(200).json("Mobile API - User Microservice");
});

module.exports = router;
