const { v4: uuidV4 } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const admin = require('firebase-admin');

const validator = require('../../utils/validator');

const postSingleFile = async (req, res, next) => {
    try {
        const imageFile = await validator.validateMulterMemorySingleItemSchema(req.file);
        const { folder } = await validator.validateSaveFolderSchema(req.body);
        const filename = uuidV4() + path.extname(imageFile.originalname);
        const bucket = admin.storage().bucket();
        const filePath = `${folder}/${filename}`;
        await bucket.file(filePath).save(imageFile.buffer, {
            metadata: { contentType: imageFile.mimetype },
        });
        const host = req.get('host');
        const downloadUri = `${req.protocol}://${host}/api/v1/file_management/download/${folder}/${filename}`;
        return res.status(StatusCodes.CREATED)
            .json({
                data: {
                    downloadUri,
                }
            });
    } catch (error) {
        return next(error);
    }
};

const postDeleteFile = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK)
            .json({ msg: 'TODO' });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    postSingleFile,
    postDeleteFile,
};