const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorSecurity.js");

/**
 * Create an attention line of security/emergency
 * @param {object} req - Object containing the name, phone, imageUri, address
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, phone, imageUri, address } =
      await validator.vWebPostRegister(req.body);

    const result = await db.Security.create({
      name,
      phone: `+57${phone}`,
      imageUri,
      address,
      active: true,
      createdAt: formatDate(new Date()),
    });
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("attention line of security/emergency could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "Name must be unique";
      error.status = StatusCodes.BAD_REQUEST;
    } 
    return next(error);
  }
};

/**
 * Update an attention line of security/emergency
 * @param {object} req - Object containing the id, name, phone, imageUri, address
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, phone, imageUri, address } =
      await validator.vWebPostUpdate(req.body);

    const attLInDb = await db.Security.findByPk(id);

    if (attLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The attention line of security/emergency does not exist`,
      };
    }

    const resultUpdate = await attLInDb.update({
      id,
      name,
      phone: `+57${phone}`,
      imageUri,
      address,
    });

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("attention line of security/emergency could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "Name must be unique";
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get all attention lines of security/emergency
 * @return {object} Response contains: statusCode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
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
    let message = undefined;
    if (attLinesInDb.count <= 0)
      message = 'There are no Security/emergency Attention Lines registered in the database.';
    if (attLinesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const totalPages = Math.ceil(attLinesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: attLinesInDb.count,
        totalPages: totalPages,
      },
      data: attLinesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get an attention line of security/emergency by id
 * @param {integer} req.params.id - attention line of security/emergency - id
 * @return {object} Response contains: statusCode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.getSecurity = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOne({
      id: req.params.id ? parseInt(req.params.id) : null,
    });

    const attentionLInDb = await db.Security.findByPk(id);

    if (attentionLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention line of security/emergency information could not be retrieved",
      };
    }

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: attentionLInDb });
  } catch (error) {
    // console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy (Soft delete) an attention line of security/emergency
 * @return {object} Response contains: statusCode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const attLInDb = await db.Security.findByPk(id);

    if (attLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The attention line of security/emergency does not exist`,
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
    // console.error("attention line could not be updated: ", error.message);
    return next(error);
  }
};