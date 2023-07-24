const express = require('express');
const router = express.Router();

const controller = require('../controllers/advertisement');

// TODO: require authentication for every point

// Retrieve all the advertisements whether they have a category or not.
router.get('/', controller.getAllAdvertisements);

// Create a new advertisement.
router.post('/', controller.postAdvertisement);





module.exports = router