const express = require("express");
const router = express.Router();
const { hasPermissions } = require("../../../../middleware/authMiddleware.js");
const categoryController = require("../controllers/mobile/categories.js");

// TODO: -- Start - DocumentTypes Endpoints
//#region DocumentTypes end-points
router.get(
  "/categories",
  // hasPermissions({ role: "super_master_user" }),
  categoryController.getAll
);
//#endregion - DocumentTypes
// TODO: -- End - DocumentTypes Endpoints 

module.exports = router;
