const { StatusCodes } = require('http-status-codes');
const xlsx = require('node-xlsx');

const db = require('../../../../models');
const validator = require('../../utils/validator');

const postUploadXlsxDependencies = async (req, res, next) => {
    try {
        const xlsxFile = await validator.validateMulterMemorySingleItemSchema(req.file);
        const dependencies = [];
        let item = null;
        try {
            const contents = xlsx.parse(xlsxFile.buffer);
            const excelContents = await validator.validateDependenciesExcelContentsSchema(contents);
            for (let i = 1; i < excelContents[0].data.length; i++) {
                item = excelContents[0].data[i].toString();
                const dependency = await validator.validateDependencySchema({
                    id: excelContents[0].data[i][0],
                    name: excelContents[0].data[i][1],
                });
                dependencies.push(dependency);
            }
        } catch (error) {
            let message = `The uploaded file is invalid: ${error.message}.`
            if (error.status != null && item != null)
                message += `\n\tErronous item: [${item}].`
            throw {
                status: StatusCodes.UNPROCESSABLE_ENTITY,
                message,
            };
        }
        return res.status(StatusCodes.CREATED)
            .json({
                meta: {
                    message: `The excel file ${xlsxFile.originalname} has been uploaded successfully.`,
                },
                data: {
                    file: { ...xlsxFile, buffer: null },
                    dependencies,
                },
            });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    postUploadXlsxDependencies
};