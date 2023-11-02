const path = require('path');

const { StatusCodes } = require('http-status-codes');
const xlsx = require('node-xlsx');

const db = require('../../../../models/index.js');
const validator = require('../../utils/validator');

// Upload an excel file that will replace all existing dependencies in the database.
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
                meta: {
                    page: 1,
                    pageSize: returnDependencies.length,
                    totalRecords: returnDependencies.length,
                    totalPages: 1,
                },
                data: returnDependencies,
            });
    } catch (error) {
        return next(error);
    }
};

// Download the excel file of all existing dependencies.
const getDownloadXlsxDependencies = async (req, res, next) => {
    try {
        const excelData = [['ID Único', 'Nombre Dependencia']];
        const dependencies = await db.Dependency.findAll({
            attributes: ['id', 'name']
        });
        dependencies.forEach(element => {
            excelData.push([element.id, element.name]);
        });
        const fileBuffer = xlsx.build([{ name: 'Lista de dependencias', data: excelData }]);;
        // Set the response headers to indicate an attachment
        res.setHeader('Content-Disposition', 'attachment; filename=Dependencias.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.status(StatusCodes.OK)
            .send(fileBuffer);
    } catch (error) {
        return next(error);
    }
};

// Download the template to create new Dependencies.
const getDownloadXlsxTemplate = async (req, res, next) => {
    try {
        const downloadPath = path.resolve(path.join(".", "static", "Plantilla Dependencias.xlsx"));
        return res.status(StatusCodes.OK)
            .sendFile(downloadPath);
    } catch (error) {
        console.error(error);
        return next({ status: StatusCodes.NOT_FOUND, message: 'The excel template has not been loaded.' });
    }
};

// Retrieve all the available dependencies.
const getAllDependencies = async (req, res, next) => {
    try {
        const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
        const offset = (pagination.number - 1) * pagination.size;
        const pageDependencies = await db.Dependency.findAndCountAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
            offset,
            limit: pagination.size,
            attributes: {
                exclude: ["deletedAt"],
            },
        });
        let message = undefined;
        if (pageDependencies.count <= 0)
            message = 'There are no Dependencies registered in the database.';
        if (pageDependencies.rows.length <= 0)
            message = '"page[number]" is too large for the number of possible pages.';
        const data = pageDependencies.rows.map(row => row.dataValues);
        return res.status(StatusCodes.OK).json({
            meta: {
                message,
                page: pagination.number,
                pageSize: pagination.size,
                totalRecords: pageDependencies.count,
                totalPages: Math.ceil(pageDependencies.count / pagination.size),
            },
            data,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    postUploadXlsxDependencies,
    getDownloadXlsxDependencies,
    getDownloadXlsxTemplate,
    getAllDependencies,
};