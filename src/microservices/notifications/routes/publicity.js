const express = require('express');
const router = express.Router();

const controller = require('../controllers/publicity');

// TODO: require authentication for every point

// Retrieve the advertisements that have no category attached.
router.get('/', controller.getUncategorized);

// Retrieve the advertisements with a category attached.
router.get('/banners', controller.getCategorized);

module.exports = router