const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();
const { hasPermissions } = require("../../../middleware/auth-middleware.js");
const users = require("../controllers/users.js");

router.post(
  "/account/signin",
  // hasPermissions({ role: "super_master_user" }),
  users.registerNewUser
);

router.post(
  "/account/login",
  // hasPermissions({ role: "super_master_user" }),
  users.validateFirebaseClientId
);

router.post(
  "/account/full_login",
  upload.single("serviceReceipt"),
  // hasPermissions({ role: "super_master_user" }),
  users.fullLogin
);

router.get("/", (req, res) => {
  res.status(200).json("my msg");
});
// define the about route
router.get("/about", (req, res) => {
  res.status(200).json("my msg");
});

router.get("/products", hasPermissions({ role: 'super_master_user'}), function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

module.exports = router;
