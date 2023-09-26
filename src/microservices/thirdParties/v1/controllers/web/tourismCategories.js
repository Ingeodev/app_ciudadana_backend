const { StatusCodes } = require("http-status-codes");

const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/tourismCategories");

/** Create one tourism category */
const postCreate = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

/** List all tourism categories */
const getAll = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

/** Update one tourism category */
const postUpdate = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

/** Delete one tourism category */
const postDelete = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAll,
  postCreate,
  postUpdate,
  postDelete,
};