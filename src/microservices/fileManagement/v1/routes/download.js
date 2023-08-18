const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/download");

router.get(
  "/:folder/:fileName",
  downloadController.downloadFile
);

module.exports = router;
