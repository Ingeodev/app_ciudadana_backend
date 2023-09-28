const express = require("express");
const router = express.Router();
const admin = require("../controllers/webAdminFree.js");

router.post("/email_verification", admin.postEmailVerification);

module.exports = router;
