const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { ne } = Op;

const db = require('../../../models');


// Retrieve the advertisements that have no category attached.
const getUncategorized = async (req, res, next) => {
    return res.status(StatusCodes.OK)
        .json({ msg: '@Daniel, este es el punto que devuelve todos los que no tienen categoría.' });
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
                model: db.AdvertisementCategory,
                as: 'AdvertisementCategory',
                attributes: ['name'],
                required: true,
            }],
            attributes: {
                include: [['imageUri', 'image'], ['siteUri', 'url']],
                exclude: ['id', 'imageUri', 'siteUri', 'categoryId', 'active', 'createdAt', 'updatedAt', 'deletedAt'],
            }
        });
        const banners = categorizedAdvertisements.map(advertisement => {
            advertisement.dataValues.category = advertisement.dataValues.AdvertisementCategory.name;
            delete advertisement.dataValues.AdvertisementCategory;
            // TODO: Check whether the url should be mapped.
            return advertisement.dataValues;
        });
        console.log(banners);
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