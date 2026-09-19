const express = require("express");
const router = express.Router();

const { hasPermissions, authMiddleware } = require("../../../../middleware/authMiddleware");
const { uploadSingleImage, uploadSinglePdf } = require('../../../../middleware/uploadMiddleware');

const uploadController = require("../controllers/upload");

router.use(authMiddleware);

router.post(
  "/image",
  uploadSingleImage,
  uploadController.postSingleFile,
);

router.post(
  "/pdf",
  uploadSinglePdf,
  uploadController.postSingleFile,
);

module.exports = router;
