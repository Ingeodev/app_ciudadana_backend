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

// * ------------------ Endpoints - appWeb -----------------------------
// router.get(
//   "/list_all_active",
//   // hasPermissions({ role: "super_master_user" }),
//   usersMobile.getAccountLoginPhase
// );
router.get("/list_all_active", (req, res) => {
  res.status(200).json("list_all_active");
});

// ! Retornar lista de endpoints?
router.get("/", (req, res) => {
  res.status(200).json("API Users Microservice");
});


module.exports = router;
