const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');
const { Sequelize } = require('sequelize');

// Retrieve all the advertisement categories.
const getAllCategories = async (req, res, next) => {
    try {
        // TODO: implement list all
        const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
        const offset = (pagination.number - 1) * pagination.size;
        // const pageAdvertisements = await db.Advertisement.findAndCountAll({
        //     unique: true,
        //     paranoid: true,
        //     order: [["createdAt", "DESC"]],
        //     offset,
        //     limit: pagination.size,
        //     include: [{
        //         model: db.AdvertisementCategory,
        //         attributes: ['name', 'color'],
        //         required: false,
        //     }],
        //     attributes: {
        //         exclude: ["deletedAt", "AdvertisementCategory"],
        //         include: [
        //             [Sequelize.col('"AdvertisementCategory"."name"'), 'categoryName'],
        //             [Sequelize.col('"AdvertisementCategory"."color"'), 'categoryColor']
        //         ],
        //     },
        // });
        // if (pageAdvertisements.count <= 0)
        //     throw {
        //         status: StatusCodes.NOT_FOUND,
        //         message: 'There are no Advertisements registered in the database.',
        //     };
        // if (pageAdvertisements.rows.length <= 0)
        //     throw {
        //         status: StatusCodes.BAD_REQUEST,
        //         message: '"page.number" is too large for the number of possible pages.',
        //     };
        // const data = pageAdvertisements.rows.map(row => {
        //     return { ...row.dataValues, AdvertisementCategory: undefined };
        // });
        return res.status(StatusCodes.OK).json({
            message: 'TODO: implement list all'
            // meta: {
            //     page: pagination.number,
            //     pageSize: pagination.size,
            //     totalRecords: pageAdvertisements.count,
            //     totalPages: Math.ceil(pageAdvertisements.count / pagination.size),
            // },
            // data,
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
        // TODO: implement delete
        return res.status(StatusCodes.OK).json({
            message: 'TODO: implement delete'
            // data: { id }
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