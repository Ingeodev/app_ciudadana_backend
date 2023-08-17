const express = require("express");
const router = express.Router();

const { hasPermissions, authMiddleware } = require("../../../../middleware/authMiddleware");
const { uploadSingleImage, uploadSinglePdf } = require('../../../../middleware/uploadMiddleware');

const uploadController = require("../controllers/upload");

router.use(authMiddleware);

router.post(
  "/image",
  // hasPermissions({ role: "super_master_user" }),
  uploadSingleImage.single('image'),
  uploadController.postSingleImage,
);

router.post(
  "/pdf",
  // hasPermissions({ role: "super_master_user" }),
  uploadSinglePdf.single('file'),
  uploadController.postSinglePdf,
);

module.exports = router;
