const path = require('path');
const fs = require('fs/promises');

const { v4: uuidV4 } = require('uuid');
const { StatusCodes } = require('http-status-codes');

const validator = require('../../utils/validator');

const uploadsFolder = path.join('..', '..', 'uploads'); // TODO: transform in env var; ask Esteban.

// TODO: check if folders exists and create them.

const postSingleImage = async (req, res, next) => {
    try {
        const imageFile = await validator.validateMulterMemorySingleItemSchema(req.file);
        const { folder } = await validator.validateSaveFolderSchema(req.body);
        const filename = uuidV4() + path.extname(imageFile.originalname);
        const uploadPath = path.join(uploadsFolder, folder, filename);
        await fs.writeFile(uploadPath, imageFile.buffer);
        const imageUri = `${req.protocol}://${req.hostname}/api/v1/file_management/download/${folder}/${filename}`;
        return res.status(StatusCodes.OK)
            .json({
                data: {
                    imageUri,
                }
            });
    } catch (error) {
        return next(error);
    }
};

const postSinglePdf = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK)
            .json({ msg: 'TODO' });
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
    postSingleImage,
    postSinglePdf,
};