const express = require('express');
const router = express.Router();

const publicityController = require('../controllers/mobilePublicity');
const attentionLinesController = require('../controllers/mobileAttentionLines');

// TODO: require MOBILE authentication for every point

//#region Publicity end-points
// Retrieve the advertisements that have no category attached.
router.get('/publicity/', publicityController.getUncategorized);

// Retrieve the advertisements with a category attached.
router.get('/publicity/banners', publicityController.getCategorized);
//#endregion

//#region Attention Lines end-points
router.get('/attention_lines', attentionLinesController.sample);
//#endregion


module.exports = router