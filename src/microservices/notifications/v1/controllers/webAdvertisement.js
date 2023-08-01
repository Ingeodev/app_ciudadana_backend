const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');

// Retrieve all the advertisements whether they have a category or not.
const getAllAdvertisements = async (req, res, next) => {
    try {
        const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
        const offset = (pagination.number - 1) * pagination.size;
        const pageAdvertisements = await db.Advertisement.findAndCountAll({
            paranoid: true,
            order: [["createdAt", "DESC"]],
            offset,
            limit: pagination.size,
            attributes: {
                exclude: ["deletedAt"]
            },
        });
        if (pageAdvertisements.count <= 0)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'There are no Advertisements registered in the database.',
            };
        return res.status(StatusCodes.OK).json({
            meta: {
                page: pagination.number,
                pageSize: pagination.size,
                totalRecords: pageAdvertisements.count,
                totalPages: Math.ceil(pageAdvertisements.count / pagination.size),
            },
            data: pageAdvertisements.rows,
        });
    } catch (error) {
        return next(error);
    }
};

// Create a new advertisement.
const postAdvertisement = async (req, res, next) => {
    try {
        const { imageUri, siteUri, categoryId } = await validator.validateAdvertisementSchema(req.body);
        const newAdvertisement = await db.Advertisement.create({
            imageUri,
            siteUri,
            categoryId,
        });
        return res.status(StatusCodes.CREATED)
            .json({ data: { ...newAdvertisement.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getAllAdvertisements,
    postAdvertisement,
};