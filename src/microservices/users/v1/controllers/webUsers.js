const { StatusCodes } = require("http-status-codes");
// const joi = require("joi");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorWeb.js");

// const Op = db.Sequelize.Op;

// TODO: -------------------------- Start - Endpoints copied from mobileController
/**
 * Create (loginPhase="notRegistered") or update (loginPhase="baseLogin") user's base information. All login must be done through firebase so additional account data is registered and the user is linked in firebase with the clientId.
 * @param {object} req - Object containing the name, lastName, phone, email
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountInfo = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();
  try {
    const clientId = res.locals.uid;
    // ! Validar los campos que son requeridos - Monday
    const { name, lastName, phone, email } = await validator.vPostAccountInfo(req.body);

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    // ! Evitar la inyeccion de codigo SQL
    const dateNow = formatDate(new Date());
    const dataUser = {
      name,
      lastName,
      phone,
      email,
    };
    let extraDataUser = {};

    // Create Case - loginPhase="notRegistered"
    // ! Validar con App Movil, si el campo se envia como null o ""?
    if (
      name === null &&
      lastName === null &&
      phone === null &&
      email === null
    ) {
      extraDataUser.clientId = clientId;
      extraDataUser.loginPhase = "notRegistered";
      extraDataUser.disabled = false;
      extraDataUser.userMobile = false;
      extraDataUser.createdAt = dateNow;

      await db.User.create(
        { ...dataUser, ...extraDataUser },
        { transaction: transactionSequelize }
      );
      await transactionSequelize.commit();

      return res.status(StatusCodes.OK).json(dataUser);
    }

    // ------------------------------------------
    // Updates Case - loginPhase="baseLogin"
    extraDataUser.loginPhase = "baseLogin";
    extraDataUser.updatedAt = dateNow;

    const resultUpdate = await db.User.update(
      { ...dataUser, ...extraDataUser },
      {
        where: {
          clientId,
          loginPhase: "notRegistered",
        },
      },
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
    return res.status(StatusCodes.OK).json(dataUser);
  } catch (error) {
    console.error("account postAccountInfo could not be created/updated: ", error.message);
    await transactionSequelize.rollback();
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Update a user (existing in db) with missing information, ie, when loginPhase="baseLogin"
 * @param {object} req - Object containing: documentType, numberDocument, residenceAddress, serviceReceiptUri, serviceReceiptSiteUri
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountFullLogin = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();
  try {
    // console.info("req.file: ", req.file);
    const clientId = res.locals.uid;

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    const {
      documentType,
      numberDocument,
      residenceAddress,
      serviceReceiptUri,
      serviceReceiptSiteUri,
    } = await validator.vPostAccountFullLogin(req.body);
    
    const dataUser = {
      documentType,
      numberDocument,
      residenceAddress,
      serviceReceiptUri,
      serviceReceiptSiteUri,
    };
    const dateNow = formatDate(new Date());
    const extraDataUser = {
      loginPhase: "inVerification",
      updatedAt: dateNow,
    };

    const resultUpdate = await db.User.update(
      { ...dataUser, ...extraDataUser },
      {
        where: {
          clientId,
          loginPhase: "baseLogin",
        },
      },
      { transaction: transactionSequelize }
    );

    if (resultUpdate[0] === 0) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        code: "Internal Server Error",
        detail: "there was an error updating the record",
      });
    }
    await transactionSequelize.commit();
    return res.status(StatusCodes.OK).json(dataUser);
  } catch (error) {
    console.error("account full_login could not be retrieved: ", error);
    await transactionSequelize.rollback();
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Gets the user information and the loginPhase
 * @return {object} Response contains: statuscode (integer), json (objeto): data. Or if there's error, json (objeto): status, code, detail
 */
exports.getAccountInfo = async (req, res, next) => {
  // ! un usuario incognito tiene clienteId?
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    const userInDb = await db.User.findOne({
      where: { clientId },
    });
    
    if (userInDb === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "user information could not be retrieved",
      });
    }

    const { loginPhase, name, lastName, email, phone } = userInDb.dataValues;

    return res.status(StatusCodes.OK).send({
      loginPhase,
      userInfo: {
        name,
        lastName,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};

/**
 * Gets the user loginPhase
 * @return {object} Response contains: statuscode (integer), json (objeto): data. Or if there's error, json (objeto): status, code, detail
 */
exports.getAccountLoginPhase = async (req, res, next) => {
  // ! un usuario incognito tiene clienteId?
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    const userInDb = await db.User.findOne({
      where: { clientId },
    });

    if (userInDb === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "user information could not be retrieved",
      });
    }

    const { loginPhase } = userInDb.dataValues;

    return res.status(StatusCodes.OK).send({
      loginPhase,
    });
  } catch (error) {
    console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};
/**
 * Update a user (existing in db) with missing information, ie, when loginPhase="fullLogin"
 * @param {object} req - Object containing: documentType, numberDocument, residenceAddress, serviceReceiptUri, serviceReceiptSiteUri
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountUpdateUser = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();
  try {
    // console.info("req.file: ", req.file);
    const clientId = res.locals.uid;

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    const { name, lastName, phone, residenceAddress } =
      await validator.vPostAccountUpdateUser(req.body);

    const dataUser = {
      name,
      lastName,
      residenceAddress,
      phone,
    };
    const dateNow = formatDate(new Date());
    const extraDataUser = {
      updatedAt: dateNow,
    };

    const resultUpdate = await db.User.update(
      { ...dataUser, ...extraDataUser },
      {
        where: {
          clientId,
          loginPhase: "fullLogin",
        },
      },
      { transaction: transactionSequelize }
    );

    if (resultUpdate[0] === 0) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        code: "Internal Server Error",
        detail: "there was an error updating the record",
      });
    }
    await transactionSequelize.commit();
    return res.status(StatusCodes.OK).json(dataUser);
  } catch (error) {
    console.error("account full_login could not be retrieved: ", error);
    await transactionSequelize.rollback();
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};
// TODO: -------------------------- End - Endpoints copied from mobileController

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
    const dataUser = {};
    if (disabled === true) {
      dataUser = {
        disabled,
        deleteAt: formatDate(new Date()),
      };
    }
    dataUser = {
      disabled
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
