const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorSecurity.js");

/**
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileMGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const attentionLInDb = await db.AttentionLine.findAndCountAll({
      where: { active: true },
      attributes: ["name", "phone", "address"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    if (attentionLInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention lines could not be recovered",
      };
    }
    // const totalPages = Math.ceil(attentionLInDb.count / objPage.size);

    return res.status(StatusCodes.OK).send(attentionLInDb.rows);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all the dependencies to submit a pqrsdf
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getDependencies = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileMGetDependencies({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const dependenciesInDb = await db.Dependency.findAndCountAll({
      where: { active: true },
      attributes: ["id", "name"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    if (dependenciesInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Dependencies could not be recovered",
      };
    }
    // const totalPages = Math.ceil(dependenciesInDb.count / objPage.size);

    return res.status(StatusCodes.OK).send(dependenciesInDb.rows);
  } catch (error) {
    console.error("Dependencies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Register a pqrsdf
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.postPqrsdf = async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    code: "OK",
    detail: "endpoint in construction",
  });
};
