const { StatusCodes } = require('http-status-codes');

const db = require('../../../../models');
const validator = require('../../utils/validator');

// Retrieve the available security attention points.
const getSecurityAttentionPoints = async (req, res, next) => {
    try {
        const { latitude, longitude } = await validator.validateSimpleLocationSchema(req.query);
        let order = [["createdAt", "DESC"]]
        if (latitude != null && longitude != null)
            order = undefined;  // TODO: use geographic point order
        const allPoints = await db.SecurityAttentionPoint.findAll({
            unique: true,
            paranoid: true,
            order,
            attributes: {
                exclude: ["deletedAt"],
            },
        });
        if (allPoints.length <= 0)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: 'There are no Security Attention Points registered in the database.',
            };
        const data = allPoints.map(row => row.dataValues);
        return res.status(StatusCodes.OK).json(data);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getSecurityAttentionPoints,
};