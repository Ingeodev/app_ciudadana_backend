const express = require("express");
const router = express.Router();
const tourimsAPI = require("../controllers/web/tourismServicesAPI.js");
const { authMiddleware, validateModuleTourism } = require("../../../../middleware/authMiddlewareApi.js");

// ------------------ Tourism Services -----------------------------
router.use(authMiddleware);
router.use(validateModuleTourism);

router.get(
  "/services/:id",
  // hasPermissions({ role: "super_master_user" }),
  tourimsAPI.getServices
);

router.post(
  "/services/",
  // hasPermissions({ role: "super_master_user" }),
  tourimsAPI.postService
);

router.post(
  "/services/edit",
  // hasPermissions({ role: "super_master_user" }),
  tourimsAPI.postEdit
);

router.post(
  "/services/delete",
  // hasPermissions({ role: "super_master_user" }),
  tourimsAPI.postDelete
);

router.post(
  "/services_bulk/",
  // hasPermissions({ role: "super_master_user" }),
  tourimsAPI.postBulkService
);

router.post(
  "/services_bulk/delete",
  // hasPermissions({ role: "super_master_user" }),
  tourimsAPI.postBulkServiceDelete
);
module.exports = router;
