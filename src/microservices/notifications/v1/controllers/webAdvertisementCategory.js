const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');

// Retrieve all the advertisement categories.
const getAllCategories = async (req, res, next) => {
    try {
        const pageAdvertisements = await db.AdvertisementCategory.findAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["deletedAt", "AdvertisementCategory"],
                include: ["id", "name", "color"],
            },
        });
        return res.status(StatusCodes.OK).json({
            message: 'TODO: implement list all',
            meta: {},
            data: pageAdvertisements,
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
    postCategoryDelete,
};