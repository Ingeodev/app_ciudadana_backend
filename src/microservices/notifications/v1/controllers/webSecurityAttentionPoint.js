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
            createdBy: undefined,
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
        const update = await validator.validateSecurityAttentionPointUpdateSchema(req.body);
        const existingPoint = await db.SecurityAttentionPoint.findByPk(update.id);
        if (existingPoint == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Security Attention Point with id ${update.id} does not exist.`
            };
        delete update.id;
        if (update.lat != null) {
            update.geolocation = {
                type: 'Point',
                coordinates: [update.lon, update.lat],
            }
            delete update.lat;
            delete update.lon;
        }
        const updatedPoint = await existingPoint.update(update);
        const data = {
            ...updatedPoint.dataValues, deletedAt: undefined, geolocation: undefined,
            createdBy: undefined,
            lat: updatedPoint.dataValues.geolocation.coordinates[1],
            lon: updatedPoint.dataValues.geolocation.coordinates[0],
        };
        return res.status(StatusCodes.OK)
            .json({
                data,
            });
    } catch (error) {
        return next(error);
    }
};

// Delete an security attention point.
const postDeleteSecurityAttentionPoint = async (req, res, next) => {
    try {
        const { id } = await validator.validateSimpleDeleteByIdSchema(req.body);
        const existingPoint = await db.SecurityAttentionPoint.findByPk(id);
        if (existingPoint == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Security Attention Point with id ${id} has already been deleted.`
            };
        await existingPoint.destroy();
        return res.status(StatusCodes.OK)
            .json({
                data: { id },
            });
    } catch (error) {
        return next(error);
    }
};

// Retrieve only one security attention point by ID
const getOneSecurityAttentionPoint = async (req, res, next) => {
    try {
        const { id } = await validator.validateSimpleDeleteByIdSchema(req.params);
        const existingPoint = await db.SecurityAttentionPoint.findByPk(id);
        if (existingPoint == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested Security Attention Point with id ${id} does not exist.`
            };
        const data = {
            ...existingPoint.dataValues, deletedAt: undefined, geolocation: undefined,
            createdBy: undefined,
            lat: existingPoint.dataValues.geolocation.coordinates[1],
            lon: existingPoint.dataValues.geolocation.coordinates[0],
        };
        return res.status(StatusCodes.OK)
            .json({
                data,
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
        const data = pagePoints.rows.map(row => {
            return {
                ...row.dataValues,
                deletedAt: undefined,
                geolocation: undefined,
                createdBy: undefined,
                lat: row.dataValues.geolocation.coordinates[1],
                lon: row.dataValues.geolocation.coordinates[0],
            };
        });
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
    getOneSecurityAttentionPoint,
};