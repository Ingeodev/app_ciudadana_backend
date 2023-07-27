const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const db = require("../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../utils/formatDate.js");
// const Op = db.Sequelize.Op;

/**
 * Get all users (web + app)
 * @return {object} Response contains: statuscode (integer), json (objeto): data. Or if there's error, json (objeto): status, code, detail
 */
exports.getUsersListAllActive = async (req, res, next) => {
  try {
    const clientId = res.locals.uid;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    const usersInDb = await User.findAll({
      where: {
        disabled: true,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]], // Ordena por la fecha de creación en orden descendente
    });

    if (usersInDb === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "users could not be recovered",
      });
    }

    return res.status(StatusCodes.OK).send(usersInDb);
  } catch (error) {
    console.error("users could not be recovered: ", error.message);
    return next(error);
  }
};
