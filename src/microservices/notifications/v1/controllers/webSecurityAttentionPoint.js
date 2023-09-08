const { StatusCodes } = require('http-status-codes');

const db = require('../../../../models');
const validator = require('../../utils/validator');

// Create an security attention point.
const postCreateSecurityAttentionPoint = async (req, res, next) => {
    try {
        const { name, description, phone, color, address, imageUri, lat, lon } =
            await validator.validateSecurityAttentionPointCreationSchema(req.body);
        const geolocation = {
            type: 'Point',
            coordinates: [lon, lat],
        };
        const createdSAP = await db.SecurityAttentionPoint.create({
            name, description, phone, color, address, imageUri, geolocation
        });
        const data = {
            ...createdSAP.dataValues, deletedAt: undefined, geolocation: undefined,
            lat: createdSAP.dataValues.geolocation.coordinates[1],
            lon: createdSAP.dataValues.geolocation.coordinates[0],
        };
        return res.status(StatusCodes.CREATED)
            .json({
                data,
            });
    } catch (error) {
        return next(error);
    }
};

// Edit an security attention point.
const postEditSecurityAttentionPoint = async (req, res, next) => {
    try {
        return res.status(StatusCodes.CREATED)
            .json({
                data: { msg: 'TODO - Edit a security attention point.' },
            });
    } catch (error) {
        return next(error);
    }
};

// Delete an security attention point.
const postDeleteSecurityAttentionPoint = async (req, res, next) => {
    try {
        return res.status(StatusCodes.CREATED)
            .json({
                data: { msg: 'TODO - Delete a security attention point.' },
            });
    } catch (error) {
        return next(error);
    }
};

// Retrieve all the available security attention points.
const getAllSecurityAttentionPoints = async (req, res, next) => {
    try {
        const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
        const offset = (pagination.number - 1) * pagination.size;
        const pagePoints = await db.SecurityAttentionPoint.findAndCountAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
            offset,
            limit: pagination.size,
            attributes: {
                exclude: ["deletedAt"],
            },
        });
        if (pagePoints.count <= 0)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'There are no Security Attention Points registered in the database.',
            };
        if (pagePoints.rows.length <= 0)
            throw {
                status: StatusCodes.BAD_REQUEST,
                message: '"page[number]" is too large for the number of possible pages.',
            };
        const data = pagePoints.rows.map(row => row.dataValues);
        return res.status(StatusCodes.OK).json({
            meta: {
                page: pagination.number,
                pageSize: pagination.size,
                totalRecords: pagePoints.count,
                totalPages: Math.ceil(pagePoints.count / pagination.size),
            },
            data,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    postCreateSecurityAttentionPoint,
    postEditSecurityAttentionPoint,
    postDeleteSecurityAttentionPoint,
    getAllSecurityAttentionPoints,
};