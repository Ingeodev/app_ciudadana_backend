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

// Update an advertisement.
const postAdvertisementEdit = async (req, res, next) => {
    try {
        const update = await validator.validateEditAdvertisementSchema(req.body);
        const advertisement = await db.Advertisement.findByPk(update.id);
        if (advertisement == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Advertisement with id ${update.id} does not exist.`
            };
        delete update.id;
        const updatedAdvertisement = await advertisement.update(update);
        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedAdvertisement.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

// Update the status of an advertisement.
const postAdvertisementStatus = async (req, res, next) => {
    try {
        const { id, active } = await validator.validateStatusAdvertisementSchema(req.body);
        const advertisement = await db.Advertisement.findByPk(id);
        if (advertisement == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Advertisement with id ${id} does not exist.`
            };
        const updatedAdvertisement = await advertisement.update({ active });
        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedAdvertisement.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

// Delete an advertisement.
const postAdvertisementDelete = async (req, res, next) => {
    try {
        const { id } = await validator.validateDeleteAdvertisementSchema(req.body);
        const advertisement = await db.Advertisement.findByPk(id);
        if (advertisement == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Advertisement with id ${id} has already been deleted.`
            };
        await advertisement.destroy();
        return res.status(StatusCodes.OK).json({
            data: { id }
        });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getAllAdvertisements,
    postAdvertisement,
    postAdvertisementEdit,
    postAdvertisementStatus,
    postAdvertisementDelete,
};