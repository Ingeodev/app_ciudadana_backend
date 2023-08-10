const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorSecurity.js");

/**
 * Create attention line
 * @param {object} req - Object containing the name, phone, imageUri, siteUri, address
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, phone, imageUri, siteUri, address } = await validator.vWebPostRegister(req.body);

    const dataQuery = {
      name,
      phone,
      imageUri,
      siteUri,
      address,
      active: true,
      createdAt: formatDate(new Date()),
    };
    
    const result = await db.Security.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    console.error(
      "attention line could not be created: ",
      error.message
    );
    return next(error);
  }
};

/**
 * Update attention line
 * @param {object} req - Object containing the id, name, phone, imageUri, siteUri, address
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postUpdate = async (req, res, next) => {
  try {
    const { id, name, phone, imageUri, siteUri, address } =
      await validator.vWebPostUpdate(req.body);

    const dataQuery = {
      id,
      name,
      phone,
      imageUri,
      siteUri,
      address,
    };

    const attLInDb = await db.Security.findByPk(id);

    if (attLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The attention line with id=${id} does not exist`,
      };
    }

    const resultUpdate = await attLInDb.update(dataQuery);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    console.error(
      "attention line could not be updated: ",
      error.message
    );
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
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const attLinesInDb = await db.Security.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (attLinesInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The requested page does not exist",
      };
    }
    const totalPages = Math.ceil(attLinesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: attLinesInDb.count,
        totalPages: totalPages,
      },
      data: attLinesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get attention line by id
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionLine = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOne({
      id: parseInt(req.params.id),
    });

    const attentionLInDb = await db.Security.findByPk(id);

    if (attentionLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention line information could not be retrieved",
      };
    }

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: attentionLInDb });
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Update the status of the attentionLines.active field (enabled/disabled) for a attention line
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const attLInDb = await db.Security.findByPk(id);

    if (attLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The attention line with id=${id} does not exist`,
      };
    }

    await attLInDb.destroy();

    // return res.status(StatusCodes.OK).json({
    //   meta: null,
    //   data: resultUpdate,
    // });
    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: { id } });
  } catch (error) {
    console.error("attention line could not be updated: ", error.message);
    return next(error);
  }
};