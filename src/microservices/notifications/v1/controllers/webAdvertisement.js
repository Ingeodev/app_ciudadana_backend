const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models/index.js');
const validator = require('../../utils/validator');
const { Sequelize } = require('sequelize');

/**
 * Checks whether an MobileService ID exists and refers to an existing category.
 * @param {number} categoryId The ID of an MobileService, or ``null``.
 * @returns {boolean} `true` if the `categoryId` is `null` or exists in the MobileService table. ``false`` otherwise.
 */
const checkCategoryExists = async (categoryId) => {
    if (categoryId != null) {
        const categoryExists = await db.MobileService.findByPk(categoryId, { attributes: ['id'], paranoid: true });
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
                model: db.MobileService,
                attributes: [],
                required: false,
            }],
            attributes: {
                exclude: ["deletedAt"],
                include: [
                    [Sequelize.col('"MobileService"."name"'), 'categoryName'],
                ],
            },
        });
        let message = undefined;
        if (pageAdvertisements.count <= 0)
            message = 'There are no Advertisements registered in the database.';
        if (pageAdvertisements.rows.length <= 0)
            message = '"page[number]" is too large for the number of possible pages.';
        const data = pageAdvertisements.rows.map((record) => {
            const row = record.toJSON();          
            return row;
        });

        return res.status(StatusCodes.OK).json({
            meta: {
                message,
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
        const { imageUri, imageMobileUri, siteUri, categoryId } =
          await validator.validateAdvertisementSchema(req.body);
        if (!await checkCategoryExists(categoryId))
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'The assigned category does not exist.',
            };
        let newAdvertisement = await db.Advertisement.create({
            imageUri,
            imageMobileUri,
            siteUri,
            categoryId,
        });
        newAdvertisement = newAdvertisement.toJSON();
        return res.status(StatusCodes.CREATED)
            .json({ data: { ...newAdvertisement, deletedAt: undefined } });
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
        let updatedAdvertisement = await advertisement.update(update);
        updatedAdvertisement = updatedAdvertisement.toJSON();
        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedAdvertisement, deletedAt: undefined } });
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
        let updatedAdvertisement = await advertisement.update({ active });
        updatedAdvertisement = updatedAdvertisement.toJSON();

        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedAdvertisement, deletedAt: undefined } });
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