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
        const createdDependencies = await db.sequelize.transaction(async transaction => {
            await db.Dependency.destroy({
                where: { deletedAt: null },
                transaction,
            });
            const allDependencies = await db.Dependency.bulkCreate(dependencies, {
                fields: ['id', 'name'],
                updateOnDuplicate: ["name", "updatedAt", "deletedAt"],
                validate: true,
                transaction,
            });
            return allDependencies;
        });
        const returnDependencies = createdDependencies.map(dep => {
            return { ...dep.dataValues, deletedAt: undefined };
        });
        return res.status(StatusCodes.CREATED)
            .json({
                data: returnDependencies,
            });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    postUploadXlsxDependencies
};