const express = require('express')
const {hasPermissions} = require("./services/auth-middleware");
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json('my msg')
})
// define the about route
router.get('/about', (req, res) => {
  res.status(200).json('my msg')
});

router.get("/products", hasPermissions({ role: 'super_master_user'}), function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

module.exports = router