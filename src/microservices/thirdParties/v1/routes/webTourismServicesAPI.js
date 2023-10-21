const { Router } = require("express");
const router = Router();
const { StatusCodes } = require("http-status-codes");
const tourimsAPI = require("../controllers/web/tourismServicesAPI.js");
const { authMiddleware, validateModuleTourism } = require("../../../../middleware/authMiddlewareApi.js");

// ------------------ Tourism Services -----------------------------
router.use(authMiddleware);
router.use(validateModuleTourism);

router.get(
  "/services/",
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

router.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = StatusCodes.NOT_FOUND;
  return next(error);
});

module.exports = router;
