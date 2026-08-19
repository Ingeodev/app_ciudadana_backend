const path = require('path');

const { StatusCodes } = require('http-status-codes');

const validator = require('../../utils/validator');
const { checkIfExists } = require('../../utils/accessCheck');

const uploadsFolder = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(path.join('..', '..', 'uploads'));

const downloadFile = async (req, res, next) => {
    try {
        const { folder, fileName } = await validator.validateDownloadSchema(req.params);
        const downloadPath = path.join(uploadsFolder, folder, fileName);
        const fileExists = await checkIfExists(downloadPath, false);
        if (!fileExists)
            throw { status: StatusCodes.NOT_FOUND, message: 'The requested file does not exist in the storage.' }
        return res.status(StatusCodes.OK)
            .sendFile(downloadPath);
    } catch (error) {
        return next(error);
    }
};

const downloadSecuredFile = async (req, res, next) => {
    try {
        const { folder, fileName } = await validator.validateDownloadSchema(req.params);
        const downloadPath = path.join(uploadsFolder, 'private', folder, fileName);
        const fileExists = await checkIfExists(downloadPath, false);
        if (!fileExists)
            throw { status: StatusCodes.NOT_FOUND, message: 'The requested file does not exist in the storage.' }
        return res.status(StatusCodes.OK)
            .sendFile(downloadPath);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    downloadFile,
    downloadSecuredFile,
};