const express = require('express');
const router = express.Router();
// const { uploadSingleJSON } = require("../../../../middleware/uploadMiddleware");
const authorization = require("../../../../middleware/authMiddleware.js");
const webRoleController = require("../controllers/webRole")
const { ROLE_ACTIONS } = require("../../../../constants/permissionsAndPolicies")

// TODO: require WEB authentication for every point (CHECK hasPermissions)
router.use(authorization.authMiddleware);

router.post(
  "/edit",
  // authorization.checkActions(ROLE_ACTIONS.create),
  // uploadSingleJSON.single("file"),
  webRoleController.postEdit
);

router.post(
  "/delete",
  // authorization.checkActions(ROLE_ACTIONS.create),
  webRoleController.postDelete
);

// Assign a role to a user
router.post(
  "/user",
  // authorization.checkActions(ROLE_ACTIONS.create),
  webRoleController.postAssignRoleToUser
);

router.post(
  "/",
  // authorization.checkActions(ROLE_ACTIONS.create),
  // uploadSingleJSON.single("file"),
  webRoleController.postRegister
);

// See which users have a certain role
router.get(
  "/user",
  // authorization.checkActions(ROLE_ACTIONS.create),
  webRoleController.getUsersByRoleId
);


// List all roles
router.get(
  "/",
  // authorization.checkActions(ROLE_ACTIONS.create),
  webRoleController.getAll
);

// router.get("/", (req, res) => {
//   res.status(200).json("Web API - Admin- Role Microservice");
// });

module.exports = router
