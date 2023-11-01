const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../../../middleware/authMiddleware");
const downloadController = require("../controllers/download");

router.get(
  "/:folder/:fileName",
  downloadController.downloadFile
);

router.use(authMiddleware);

router.get(
  "/secure/:folder/:fileName",
  // TODO: Check permissions
  downloadController.downloadSecuredFile,
);

module.exports = router;
