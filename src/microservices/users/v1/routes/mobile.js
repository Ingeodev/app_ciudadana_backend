const express = require("express");
const router = express.Router();
const Busboy = require('busboy');
const { hasPermissions , authMiddlewareMobile} = require("../../../../middleware/authMiddleware.js");
const usersMobile = require("../controllers/mobile/users.js");
const documentTypes = require("../controllers/mobile/documentTypes.js");
const { uploadSingleImage } = require("../../../../middleware/uploadMiddleware.js");
const uploadController = require("../../../fileManagement/v1/controllers/upload.js");
router.use(authMiddlewareMobile);

const parseInfoField = (req, res, next) => {
  if (!req.rawBody) {
    return next(Object.assign(new Error("rawBody not available"), { status: 500 }));
  }
  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  busboy.on("field", (name, value) => { fields[name] = value; });
  busboy.on("close", () => { req.body = fields; next(); });
  busboy.end(req.rawBody);
};

// * ------------------ Endpoints - appMobile -----------------------------
router.post(
  "/account/info",
  // hasPermissions({ role: "super_master_user" }),
  usersMobile.postAccountInfo
);

router.post(
  "/account/full_login",
  uploadSingleImage,
  usersMobile.postAccountBaseLogin
);

router.post(
  "/account/full_login/upload-file",
  uploadSingleImage,
  uploadController.postSingleFile
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

router.post(
  "/account/delete",
  usersMobile.deleteAccount
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
