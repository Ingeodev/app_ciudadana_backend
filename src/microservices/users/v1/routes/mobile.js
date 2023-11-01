const express = require("express");
const router = express.Router();
const { hasPermissions , authMiddlewareMobile} = require("../../../../middleware/authMiddleware.js");
const usersMobile = require("../controllers/mobile/users.js");
const documentTypes = require("../controllers/mobile/documentTypes.js");
const { uploadImagesPdfs } = require("../../../../middleware/uploadMiddleware.js");
router.use(authMiddlewareMobile);

// * ------------------ Endpoints - appMobile -----------------------------
router.post(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.postAccountInfo
);

router.post(
  "/account/full_login",
  // hasPermissions({ role: "super_master_user" }),
  uploadImagesPdfs.single("file"),
  usersMobile.postAccountBaseLogin
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
  "/account/edit",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.postAccountFullLogin
);

// TODO: -- Start - DocumentTypes Endpoints
//#region DocumentTypes end-points
router.get(
  "/document_types",
  // hasPermissions({ role: "super_master_user" }),
  documentTypes.getAll
);
//#endregion - DocumentTypes
// TODO: -- End - DocumentTypes Endpoints 

module.exports = router;
