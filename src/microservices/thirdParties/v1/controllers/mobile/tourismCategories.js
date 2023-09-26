const { StatusCodes } = require("http-status-codes");

const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/mobile/tourismCategories");
const { formatColorOutputForMobile } = require("../../../../../utils/mobileColorFormatter");

/** List all the tourism categories in the mobile format */
const getAll = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAll
};