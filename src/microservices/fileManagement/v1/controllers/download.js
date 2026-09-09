const { StatusCodes } = require('http-status-codes');
const validator = require('../../utils/validator');
const admin = require('firebase-admin');

const downloadFile = async (req, res, next) => {
    try {
        const { folder, fileName } = await validator.validateDownloadSchema(req.params);
        const bucket = admin.storage().bucket();
        const file = bucket.file(`${folder}/${fileName}`);
        const [exists] = await file.exists();
        if (!exists)
            throw { status: StatusCodes.NOT_FOUND, message: 'The requested file does not exist in the storage.' };
        const [metadata] = await file.getMetadata();
        res.set('Content-Type', metadata.contentType || 'application/octet-stream');
        file.createReadStream().pipe(res);
    } catch (error) {
        return next(error);
    }
};

const downloadSecuredFile = async (req, res, next) => {
    try {
        const { folder, fileName } = await validator.validateDownloadSchema(req.params);
        const bucket = admin.storage().bucket();
        const file = bucket.file(`private/${folder}/${fileName}`);
        const [exists] = await file.exists();
        if (!exists)
            throw { status: StatusCodes.NOT_FOUND, message: 'The requested file does not exist in the storage.' };
        const [metadata] = await file.getMetadata();
        res.set('Content-Type', metadata.contentType || 'application/octet-stream');
        file.createReadStream().pipe(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    downloadFile,
    downloadSecuredFile,
};