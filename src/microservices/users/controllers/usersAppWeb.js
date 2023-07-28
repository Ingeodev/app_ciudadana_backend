const { StatusCodes } = require("http-status-codes");
// const joi = require("joi");
const db = require("../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../utils/formatDate.js");
const validator = require("../utils/validator.js");

// const Op = db.Sequelize.Op;

/**
 * Get all users (web + app)
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.getUsersListAll = async (req, res, next) => {
  try {
    const { page, pageSize } = await validator.vGetUsersListAll({
        "page" : parseInt(req.query.page) || 1,
        "pageSize" : parseInt(req.query.pageSize) || 10
      });

    const usersInDb = await db.User.findAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]], // Ordena por la fecha de creación en orden descendente
    });

    if (!Array.isArray(usersInDb) || !usersInDb.length || usersInDb === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "users could not be recovered",
      });
    }

    return res.status(StatusCodes.OK).send(usersInDb);
  } catch (error) {
    console.error("users could not be recovered: ", error.message);
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
 * Update the status of the users.disabled field (enabled/disabled) for a user
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.postUsersUpdateDisabled = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();

  try {
    const { clientId, disabled } = await validator.vPostUsersUpdateDisabled(req.body);
    const dataUser = {
      disabled,
      updatedAt: formatDate(new Date())
    };

    const resultUpdate = await db.User.update(
      dataUser,
      { where: { clientId } },
      { transaction: transactionSequelize }
    );

    if (resultUpdate[0] === 0) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "invalid input",
      });
    }
    await transactionSequelize.commit();
    return res.status(StatusCodes.OK).json({ clientId, disabled });
  } catch (error) {
    console.error("users could not be updated: ", error.message);
    await transactionSequelize.rollback();
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
 * Update the users.loginPhase="inVerification" to "fullLogin"
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.postUsersUpdateLoginPhaseFullLogin = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();
  try {
    const { clientId } = await validator.vPostUsersUpdateLoginPhaseFullLogin(req.body);
    
    const resultUpdate = await db.User.update(
      {
        loginPhase: "fullLogin",
        updatedAt: formatDate(new Date())
      },
      {
        where: {
          clientId,
          loginPhase: "inVerification",
        },
      },
      { transaction: transactionSequelize }
    );

    console.log("resultUpdate:", resultUpdate[0]);

    if (resultUpdate[0] === 0) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "user could not be updated",
      });
    }
    await transactionSequelize.commit();
    return res.status(StatusCodes.OK).json({ clientId });
  } catch (error) {
    console.error("user could not be updated: ", error.message);
    await transactionSequelize.rollback();
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
