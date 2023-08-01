const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const { page, pageSize } = await validator.vAttentionLGetListAll({
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 10,
    });

    // const attentionLInDb = await db.AttentionLine.findAll({
    //   limit: pageSize,
    //   offset: (page - 1) * pageSize,
    //   order: [["createdAt", "DESC"]], // Ordena por la fecha de creación en orden descendente
    // });

    const attentionLInDb = await db.AttentionLine.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (attentionLInDb.count === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "attention lines could not be recovered",
      });
    }

    return res.status(StatusCodes.OK).send(attentionLInDb.rows);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    return next(error);
  }
};

/**
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getDependencies = async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    code: "OK",
    detail: "endpoint in construction",
  });
  try {
    const { page, pageSize } = await validator.vAttentionLGetListAll({
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 10,
    });

    const attentionLInDb = await db.AttentionLine.findAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]], // Ordena por la fecha de creación en orden descendente
    });

    if (
      !Array.isArray(attentionLInDb) ||
      !attentionLInDb.length ||
      attentionLInDb === null
    ) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "attention lines could not be recovered",
      });
    }

    return res.status(StatusCodes.OK).send(attentionLInDb);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    return next(error);
  }
};

/**
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.postPqrsdf = async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    code: "OK",
    detail: "endpoint in construction",
  });
};
