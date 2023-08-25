const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');

// Retrieve all the advertisement categories.
const getAllCategories = async (req, res, next) => {
    try {
        const { page: pagination } = await validator.validateSimplePaginationSchema({
            page: {
                number: 1,
                size: 100,
            },
            ...req.query,
        });
        const offset = (pagination.number - 1) * pagination.size;
        const pageCategories = await db.AdvertisementCategory.findAndCountAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["deletedAt"],
                include: ["id", "name", "color"],
            },
            limit: pagination.size,
            offset,
        });
        if (pageCategories.count <= 0)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'There are no Advertisement Categories registered in the database.',
            };
        if (pageCategories.rows.length <= 0)
            throw {
                status: StatusCodes.BAD_REQUEST,
                message: '"page[number]" is too large for the number of possible pages.',
            };
        return res.status(StatusCodes.OK).json({
            meta: {
                page: pagination.number,
                pageSize: pagination.size,
                totalRecords: pageCategories.count,
                totalPages: Math.ceil(pageCategories.count / pagination.size),
            },
            data: pageCategories.rows,
        });
    } catch (error) {
        return next(error);
    }
};

// Create a new advertisement category.
const postCategory = async (req, res, next) => {
    try {
        const { name, color } = await validator.validateAdvertisementCategorySchema(req.body);
        const newCategory = await db.AdvertisementCategory.create({
            name,
            color,
        });
        return res.status(StatusCodes.CREATED)
            .json({ data: { ...newCategory.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

// Edit an existing advertisement category.
const postEditCategory = async (req, res, next) => {
    try {
        const update = await validator.validateEditAdvertisementCategorySchema(req.body);
        const category = await db.AdvertisementCategory.findByPk(update.id);
        if (category == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Advertisement Category with id ${update.id} does not exist.`
            };
        delete update.id;
        const updatedCategory = await category.update(update);
        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedCategory.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

// Delete an advertisement category ONLY IF NO ADVERTISEMENTS HAS THAT CATEGORY.
const postCategoryDelete = async (req, res, next) => {
    try {
        const { id } = await validator.validateSimpleDeleteByIdSchema(req.body);
        const category = await db.AdvertisementCategory.findByPk(id, {
            include: [{
                model: db.Advertisement,
                attributes: ['id'],
                required: false,
            }],
            attributes: ['id'],
            paranoid: true,
        });
        if (category == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Advertisement Category with id ${id} has already been deleted.`
            };
        if (category.Advertisement != null)
            throw {
                status: StatusCodes.UNPROCESSABLE_ENTITY,
                message: `The requested Advertisement Category with id ${id} has related Advertisements.`
            };
        await category.destroy();
        return res.status(StatusCodes.OK).json({
            data: { id }
        });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getAllCategories,
    postCategory,
    postEditCategory,
    postCategoryDelete,
};