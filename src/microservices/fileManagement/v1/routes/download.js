const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/download");

router.get(
  "/:folder/:file",
  downloadController.downloadFile
);

module.exports = router;
