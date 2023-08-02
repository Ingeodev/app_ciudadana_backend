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
    // TODO: Pagination
    // const objPage = await validator.vMobileMGetListAll({
    //   number: req.query.page ? parseInt(req.query.page.number) || 1 : 1,
    //   size: req.query.page ? parseInt(req.query.page.size) || 10 : 10,
    // });

    const attentionLInDb = await db.AttentionLine.findAll({
      where: { active: true },
      attributes: ["name", "phone", "whatsapp"],
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    if (
      !Array.isArray(attentionLInDb) ||
      !attentionLInDb.length ||
      attentionLInDb === null
    ) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention lines could not be recovered",
      };
    }
    return res.status(StatusCodes.OK).send(attentionLInDb);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};


/**
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getDependencies = async (req, res, next) => {
  try {
    // TODO: Pagination
    // const objPage = await validator.vMobileMGetDependencies({
    //   number: req.query.page ? parseInt(req.query.page.number) || 1 : 1,
    //   size: req.query.page ? parseInt(req.query.page.size) || 10 : 10,
    // });

    const dependenciesInDb = await db.Dependency.findAll({
      where: { active: false },
      attributes: ["id", "name"],
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    if (
      !Array.isArray(dependenciesInDb) ||
      !dependenciesInDb.length ||
      dependenciesInDb === null
    ) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Dependencies could not be recovered",
      };
    }
    return res.status(StatusCodes.OK).send(dependenciesInDb);
  } catch (error) {
    console.error("Dependencies could not be recovered: ", error.message);
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
