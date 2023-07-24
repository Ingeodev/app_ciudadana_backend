const { StatusCodes } = require('http-status-codes');
const db = require('../../../models');

// Retrieve all the advertisements whether they have a category or not.
const getAllAdvertisements = async (req, res, next) => {
    return res.status(StatusCodes.OK)
        .json({ msg: 'Should retrieve all the advertisements whether they have a category or not.' });
};

// Create a new advertisement.
const postAdvertisement = async (req, res, next) => {
    try {
        // TODO: Validate the incoming data
        const { imageUri, siteUri, categoryId } = req.body;
        const newAdvertisement = await db.Advertisement.create({
            imageUri,
            siteUri,
            categoryId,
        });
        return res.status(StatusCodes.CREATED)
            .json({ msg: 'New advertisement created.', newAdvertisement });
    } catch (error) {
        return next(error);
    }

};


module.exports = {
    getAllAdvertisements,
    postAdvertisement,
};