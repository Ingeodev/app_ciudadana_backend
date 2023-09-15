const express = require('express');
const router = express.Router();
const { uploadSingleJSON } = require("../../../../middleware/uploadMiddleware");
const authorization = require("../../../../middleware/authMiddleware.js");
const webRoleController = require("../controllers/webRole")
const { ROLE_ACTIONS } = require("../../../../constants/permissionsAndPolicies")

// TODO: require WEB authentication for every point (CHECK hasPermissions)
router.use(authorization.authMiddleware);
router.post(
  "/",
  // authorization.checkActions(ROLE_ACTIONS.create),
  uploadSingleJSON.single("file"),
  webRoleController.postRegister
);

router.post(
  "/edit",
  // authorization.checkActions(ROLE_ACTIONS.create),
  uploadSingleJSON.single("file"),
  webRoleController.postEdit
);

router.post(
  "/delete",
  // authorization.checkActions(ROLE_ACTIONS.create),
  webRoleController.postDelete
);

router.get(
  "/",
  // authorization.checkActions(ROLE_ACTIONS.create),
  webRoleController.getAll
);

// router.get("/", (req, res) => {
//   res.status(200).json("Web API - Admin- Role Microservice");
// });

module.exports = router
