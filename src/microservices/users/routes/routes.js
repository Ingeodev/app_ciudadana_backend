const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();
const { hasPermissions } = require("../../../middleware/authMiddleware.js");
const users = require("../controllers/users.js");

router.post(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  users.postAccountInfo
);

router.post(
  "/account/full_login",
  upload.single("serviceReceipt"),
  // hasPermissions({ role: "super_master_user" }),
  users.accountFullLogin
);

router.get(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  users.getAccountInfo
);

router.get(
  "/account/login/phase",
  // hasPermissions({ role: "super_master_user" }),
  users.getAccountLoginPhase
);

// ! Retornar lista de endpoints?
router.get("/", (req, res) => {
  res.status(200).json("my msg");
});

router.get("/products", hasPermissions({ role: 'super_master_user'}), function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

module.exports = router;
