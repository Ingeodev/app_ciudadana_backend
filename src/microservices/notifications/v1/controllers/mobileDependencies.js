const { StatusCodes } = require("http-status-codes");

const db = require('../../../../models');
const validator = require('../../utils/validator');

/**
 * Get all the dependencies to submit a pqrsdf
 * @return {object} Response contains: statuscode (integer), json (list): data dependencies. Or if there's error, json (object): status, code, detail
 */
const getDependencies = async (req, res, next) => {
  try {
    const { page: objPage } = await validator.validateSimplePaginationSchema({
      page: {
        number: 1,
        size: 500,
      },
      ...req.query,
    });

    const dependenciesInDb = await db.Dependency.findAndCountAll({
      attributes: ["id", "name"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    const returnDependencies = dependenciesInDb.rows.map(row => row.dataValues);
    return res.status(StatusCodes.OK).send(returnDependencies);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDependencies
};