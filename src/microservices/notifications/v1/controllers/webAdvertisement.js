const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');

// Retrieve all the advertisements whether they have a category or not.
const getAllAdvertisements = async (req, res, next) => {
    try {
        const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
        let offset;
        let pageSize;
        let page = 1;
        if (pagination != null) {
            offset = (pagination.number - 1) * pagination.size;
            pageSize = pagination.size;
            page = pagination.number;
        }
        const pageAdvertisements = await db.Advertisement.findAndCountAll({
            paranoid: true,
            order: [["createdAt", "DESC"]],
            offset,
            limit: pageSize,
            attributes: {
                exclude: ["deletedAt"]
            },
        });
        if (pageAdvertisements.count <= 0)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'There are no Advertisements registered in the database.',
            };
        if (pageSize == null)
            pageSize = pageAdvertisements.count;
        return res.status(StatusCodes.OK).json({
            meta: {
                page,
                pageSize,
                totalRecords: pageAdvertisements.count,
                totalPages: Math.ceil(pageAdvertisements.count / pageSize),// TODO: Validar si lo hace el front o back
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
            .json({ data: {...newAdvertisement.dataValues, deletedAt: undefined} });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getAllAdvertisements,
    postAdvertisement,
};