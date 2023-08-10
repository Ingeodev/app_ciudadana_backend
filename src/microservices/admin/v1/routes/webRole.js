const express = require('express');
const router = express.Router();
const authorization = require("../../../../middleware/authMiddleware.js");
const webRoleController = require("../controllers/webRole")
const { ROLE_PERMISSIONS } = require("../../../../constants/permissionsAndPolicies")

// TODO: require WEB authentication for every point (CHECK hasPermissions)
// router.use(authorization.authMiddleware);

router.post(
  "/create",
   authorization.checkPermissions(ROLE_PERMISSIONS.create),
   webRoleController.createRole
);

router.get("/", (req, res) => {
  res.status(200).json("Web API - Admin Microservice");
});

module.exports = router
