const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Get current attention line
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionLine = async (req, res, next) => {
  try {
    const attentionLineDb = await db.AttentionLine.findOne({
      attributes: ["phone", "whatsapp"],
      // Ordered from current date
      order: [["createdAt", "DESC"]],
    });

    if (attentionLineDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention line information could not be retrieved",
      };
    }
    return res.status(StatusCodes.OK).send(attentionLineDb);
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

    if (dependenciesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Dependencies registered in the database",
      };
    if (dependenciesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    // const totalPages = Math.ceil(dependenciesInDb.count / objPage.size);

    return res.status(StatusCodes.OK).send(dependenciesInDb.rows);
  } catch (error) {
    console.error("Dependencies could not be recovered: ", error.message);
    return next(error);
  }
};
