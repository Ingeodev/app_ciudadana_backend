const express = require("express");
const router = express.Router();
const { hasPermissions, authMiddlewareMobile } = require("../../../../middleware/authMiddleware.js");
const roadStatesController = require("../controllers/mobile/roadStates.js");
const bicyclesController = require("../controllers/mobile/bicyclesTermsConditions.js");
router.use(authMiddlewareMobile);

// --------------------- Road States ----------------------------
//#region Road States end-points
router.get(
  "/mobility",
  // hasPermissions({ role: "super_master_user" }),
  roadStatesController.getRoadStates
);

//#endRegion - Road States

// --------------------- Bicycles - TermsConditions ----------------------------
//#region Road States end-points
router.get(
  "/bikes/terms",
  // hasPermissions({ role: "super_master_user" }),
  bicyclesController.getTerms
);

router.post(
  "/bikes/terms/agree",
  // hasPermissions({ role: "super_master_user" }),
  bicyclesController.postAcceptTerms
);

router.get(
  "/bikes/terms/agree",
  // hasPermissions({ role: "super_master_user" }),
  bicyclesController.getAcceptTerms
);

//#endRegion - Road States

module.exports = router;
