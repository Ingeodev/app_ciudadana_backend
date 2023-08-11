const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../../middleware/formatDate.js");
const validator = require("../../../utils/validators/web/documentTypes.js");

/**
 * Create a document type
 * @param {object} req - Object containing the code, name, abbreviation
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { code, name } = await validator.vWebPostRegister(
      req.body
    );

    const dataQuery = {
      code,
      name,
      active: true,
    };

    const result = await db.DocumentType.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("document type could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update document type
 * @param {object} req - Object containing the code, name, abbreviation
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, code, name } = await validator.vWebPostEdit(req.body);

    const dataQuery = {
      id,
      code,
      name,
    };

    const docTypeInDb = await db.DocumentType.findByPk(id);

    if (docTypeInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The document type with id=${id} does not exist`,
      };
    }

    const resultUpdate = await docTypeInDb.update(dataQuery);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("document type could not be updated: ", error.message);
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};


/**
 * Get all document types
 * @return {object} Response contains: statuscode (integer), json (objeto): data document types. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const docTypesInDb = await db.DocumentType.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (docTypesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Document types registered in the database",
      };
    }
    if (docTypesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(docTypesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: docTypesInDb.count,
        totalPages: totalPages,
      },
      data: docTypesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("document types could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get document type by id
 * @return {object} Response contains: statuscode (integer), json (objeto): data document type. Or if there's error, json (objeto): status, code, detail
 */
exports.getOneById = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOneById({
      id: parseInt(req.params.id),
    });

    const docTypeInDb = await db.DocumentType.findByPk(id);

    if (docTypeInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Document type information could not be retrieved",
      };
    }

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: docTypeInDb });
  } catch (error) {
    // console.error("Document Type could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Update the status of the documentType.active field (enabled/disabled) for a document type
 * @return {object} Response contains: statuscode (integer), json (objeto): data document type. Or if there's error, json (objeto): status, code, detail
 */
exports.postStatus = async (req, res, next) => {
  try {
    const { id, active } = await validator.vWebPostStatus(req.body);
    const docTypeInDb = await db.DocumentType.findByPk(id);

    if (docTypeInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The document type with id=${id} does not exist`,
      };
    }

    await docTypeInDb.update(active);

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: { id, active } });
  } catch (error) {
    // console.error("document type could not be updated: ", error.message);
    return next(error);
  }
};