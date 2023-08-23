const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');
const { Sequelize } = require('sequelize');

/**
 * Checks whether an AdvertisementCategory ID exists and refers to an existing category.
 * @param {number} categoryId The ID of an AdvertisementCategory, or ``null``.
 * @returns {boolean} `true` if the `categoryId` is `null` or exists in the AdvertisementCategory table. ``false`` otherwise.
 */
const checkCategoryExists = async (categoryId) => {
    if (categoryId != null) {
        const categoryExists = await db.AdvertisementCategory.findByPk(categoryId, { attributes: ['id'], paranoid: true });
        if (categoryExists == null)
            return false;
    }
    return true;
};

// Retrieve all the advertisements whether they have a category or not.
const getAllAdvertisements = async (req, res, next) => {
    try {
        const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
        const offset = (pagination.number - 1) * pagination.size;
        const pageAdvertisements = await db.Advertisement.findAndCountAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
            offset,
            limit: pagination.size,
            include: [{
                model: db.AdvertisementCategory,
                attributes: ['name', 'color'],
                required: false,
            }],
            attributes: {
                exclude: ["deletedAt", "AdvertisementCategory"],
                include: [
                    [Sequelize.col('"AdvertisementCategory"."name"'), 'categoryName'],
                    [Sequelize.col('"AdvertisementCategory"."color"'), 'categoryColor']
                ],
            },
        });
        if (pageAdvertisements.count <= 0)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'There are no Advertisements registered in the database.',
            };
        if (pageAdvertisements.rows.length <= 0)
            throw {
                status: StatusCodes.BAD_REQUEST,
                message: '"page.number" is too large for the number of possible pages.',
            };
        const data = pageAdvertisements.rows.map(row => {
            return { ...row.dataValues, AdvertisementCategory: undefined };
        });
        return res.status(StatusCodes.OK).json({
            meta: {
                page: pagination.number,
                pageSize: pagination.size,
                totalRecords: pageAdvertisements.count,
                totalPages: Math.ceil(pageAdvertisements.count / pagination.size),
            },
            data,
        });
    } catch (error) {
        return next(error);
    }
};

// Create a new advertisement.
const postAdvertisement = async (req, res, next) => {
    try {
        const { imageUri, siteUri, categoryId } = await validator.validateAdvertisementSchema(req.body);
        if (!await checkCategoryExists(categoryId))
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'The assigned category does not exist.',
            };
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
        if (!await checkCategoryExists(update.categoryId))
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'The assigned category does not exist.',
            };
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
        const { id } = await validator.validateSimpleDeleteByIdSchema(req.body);
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