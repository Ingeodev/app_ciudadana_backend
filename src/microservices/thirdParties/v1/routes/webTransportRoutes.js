const { Router } = require("express");
const router = Router();
const { uploadSingleExcel } = require('../../../../middleware/uploadMiddleware');
const transpRoutesController = require("../controllers/web/transportRoutes.js");

// * ------------------ Company Routes -----------------------------
router.get(
  "/template",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getDownloadXlsxTemplate
);

router.get(
  "/itinerary",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getItinerary
);

router.post(
  "/",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postRegister
);

router.post(
  "/edit",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postEdit
);

router.post(
  "/delete",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.postDelete
);

router.get(
  "/companies",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getCompaniesNRoutes
);

router.post(
  "/excel",
  // hasPermissions({ role: "super_master_user" }),
  uploadSingleExcel.single("file"),
  transpRoutesController.postUploadXlsx
);

router.get(
  "/:companyId",
  // hasPermissions({ role: "super_master_user" }),
  transpRoutesController.getAll
);
module.exports = router;
