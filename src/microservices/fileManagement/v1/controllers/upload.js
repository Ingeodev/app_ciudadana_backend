const path = require('path');
const fsp = require('fs/promises');
 const fs = require('fs');

const { v4: uuidV4 } = require('uuid');
const { StatusCodes } = require('http-status-codes');

const validator = require('../../utils/validator');
const { checkIfExists } = require('../../utils/accessCheck');

const uploadsFolder = path.join('..', '..', 'uploads'); // TODO: transform in env var; ask Esteban.

const postSingleFile = async (req, res, next) => {
    try {
        const imageFile = await validator.validateMulterMemorySingleItemSchema(req.file);
        const { folder } = await validator.validateSaveFolderSchema(req.body);
        const filename = uuidV4() + path.extname(imageFile.originalname);   // TODO: Ask whether a table for stored files is necessary.
        const folderPath = path.join(uploadsFolder, folder);
        await checkIfExists(folderPath, true);
        const uploadPath = path.join(folderPath, filename);
        // TEST Write a test file to the provided path.
        const date = new Date();
        const formattedDate = date.toString().split(' ').slice(0, 5).join('-');
        const testFilename = `${formattedDate}.txt`;
        const contents = `This test file was created on ${formattedDate}.\n`;
        try {
            const writer = fs.createWriteStream(`${folderPath}/${testFilename}`);
            writer.write('hello world');
            console.log('done')
        } catch (error) {
            console.error(error);
        }
        // END TEST
        // await fs.writeFile(uploadPath, imageFile.buffer);
        fs.writeFileSync(uploadPath, imageFile.buffer);
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