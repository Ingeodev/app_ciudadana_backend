const express = require("express");
const router = express.Router();

const authorization = require("../../../../middleware/authMiddleware");
const downloadController = require("../controllers/download");

router.get(
  "/:folder/:fileName",
  downloadController.downloadFile
);

router.use(authorization.authMiddleware);

router.get(
  "/secure/:folder/:fileName",
  // TODO: Check permissions
  downloadController.downloadSecuredFile,
);

module.exports = router;
