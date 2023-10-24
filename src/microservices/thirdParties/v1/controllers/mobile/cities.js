const { StatusCodes } = require("http-status-codes");
const { col } = require("sequelize");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/mobile/cities.js");

/**
 * Get all  Cities
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileGetCities({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 2000,
    });

    const citiesInDb = await db.City.findAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["city", "ASC"]],
      attributes: ["id", [col("city"), "name"]],
    });

    return res.status(StatusCodes.OK).send(citiesInDb);
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};
