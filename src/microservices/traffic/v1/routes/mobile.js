const express = require("express");
const router = express.Router();
const { hasPermissions, authMiddlewareMobile } = require("../../../../middleware/authMiddleware.js");
const roadStatesController = require("../controllers/mobile/roadStates.js");
router.use(authMiddlewareMobile);

// --------------------- Road States ----------------------------
//#region Road States end-points
router.get(
  "/mobility",
  // hasPermissions({ role: "super_master_user" }),
  roadStatesController.getRoadStates
);

//#endRegion - Road States

module.exports = router;
