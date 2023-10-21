const { Router } = require("express");
const router = Router();
const { StatusCodes } = require("http-status-codes");
// const { uploadSingleExcel } = require('../../../../middleware/uploadMiddleware');
const transpRoutesController = require("../controllers/web/transportRoutesAPI.js");
const { authMiddleware, validateModuleTransportRoutes } = require("../../../../middleware/authMiddlewareApi.js");

router.use(authMiddleware);
router.use(validateModuleTransportRoutes);

// * ------------------ Date of Routes Timetables -----------------------------
router.post(
  "/route/date/",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postDateRegister
);

router.post(
  "/route/date/hours",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postDateRegisterWithHour
);

router.post(
  "/route/date/edit",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postDateEdit
);

router.post(
  "/route/date/delete",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postDateDelete
);

router.get(
  "/route/date/",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getDateAll
);

// * ------------------ Hour n Tariff of Routes Timetables -----------------------------
router.post(
  "/route/hour/",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postHourRegister
);

router.post(
  "/route/hour/edit",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postHourEdit
);

router.post(
  "/route/hour/delete",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postHourDelete
);

router.get(
  "/route/hour/",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getHourAll
);

// * ------------------ Company Routes -----------------------------

// router.get(
//   "/route/template",
//   // hasPermissions({ role: "super_master_user" }),
//   transpRoutesController.getRouteDownloadXlsxTemplate
// );

// router.post(
//   "/route/excel",
//   // hasPermissions({ role: "super_master_user" }),
//   uploadSingleExcel.single("file"),
//   transpRoutesController.postRouteUploadXlsx
// );

router.get(
  "/route/itinerary",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getRouteItinerary
);

router.post(
  "/route/",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postRouteRegister
);

router.post(
  "/route/edit",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postRouteEdit
);

router.post(
  "/route/delete",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postRouteDelete
);

router.get(
  "/route",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getRouteAll
);

router.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = StatusCodes.NOT_FOUND;
  return next(error);
});

module.exports = router;
