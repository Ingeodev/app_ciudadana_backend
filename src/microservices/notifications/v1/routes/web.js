const express = require('express');
const router = express.Router();

const advertisingController = require('../controllers/webAdvertisement');
const attentionLinesController = require('../controllers/webAttentionLines');
const alertController = require('../controllers/webAlert');

// TODO: require WEB authentication for every point

//#region Advertisements end-points
// Retrieve all the advertisements whether they have a category or not.
router.get('/advertising', advertisingController.getAllAdvertisements);

// Create a new advertisement.
router.post('/advertising', advertisingController.postAdvertisement);
//#endregion

//#region Attention Lines end-points
router.get('/attention_lines', attentionLinesController.sample);
//#endregion

//#region Alerts end-points
router.post('/alert', alertController.sendAlerts);
//#endregion

module.exports = router