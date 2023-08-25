const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/validator');

const postUploadXlsxDependencies = async (req, res, next) => {
    try {
        const xlsxFile = await validator.validateMulterMemorySingleItemSchema(req.file);
        return res.status(StatusCodes.CREATED)
            .json({
                meta: {
                    message: `The excel file ${xlsxFile.originalname} has been uploaded successfully.`,
                },
                data: { ...xlsxFile, buffer: null },
            });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    postUploadXlsxDependencies
};