const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { ne, eq } = Op;

const db = require('../../../../models');


// Retrieve the advertisements that have no category attached.
const getUncategorized = async (req, res, next) => {
    try {
        const notCategorizedAdvertisements = await db.Advertisement.findAll({
            where: {
                active: true,
                categoryId: { [eq]: null },
            },
            attributes: {
                include: [['imageUri', 'image'], ['siteUri', 'url']],
                exclude: ['id', 'imageUri', 'siteUri', 'categoryId', 'active', 'createdAt', 'updatedAt', 'deletedAt'],
            }
        });
        return res.status(StatusCodes.OK)
            .json(notCategorizedAdvertisements);
    } catch (error) {
        return next(error);
    }
};

// Retrieve the advertisements with a category attached.
const getCategorized = async (req, res, next) => {
    try {
        const categorizedAdvertisements = await db.Advertisement.findAll({
            where: {
                active: true,
                categoryId: { [ne]: null },
            },
            include: [{
                model: db.MobileService,
                as: 'MobileService',
                attributes: ['route'],
                required: true,
            }],
            attributes: {
                include: [['imageUri', 'image'], ['siteUri', 'url']],
                exclude: ['id', 'imageUri', 'siteUri', 'categoryId', 'active', 'createdAt', 'updatedAt', 'deletedAt'],
            }
        });
        const banners = categorizedAdvertisements.map(advertisement => {
            advertisement.dataValues.category = advertisement.dataValues.MobileService.route;
            delete advertisement.dataValues.MobileService;
            return advertisement.dataValues;
        });
        return res.status(StatusCodes.OK)
            .json(banners);
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getUncategorized,
    getCategorized,
};