const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const { col } = require('sequelize');

/**
 * Get all  Cities
 * @return {object} Response contains: statusCode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
    try {
  
      const citiesInDb = await db.City.findAll({
        order: [["city", "ASC"]],
        attributes: ["id", [col('city'), 'name']],
      });
  
      return res.status(StatusCodes.OK).send(citiesInDb);
    } catch (error) {
      // console.error("Cities could not be recovered: ", error.message);
      return next(error);
    }
  };