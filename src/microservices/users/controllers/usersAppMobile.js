const { StatusCodes } = require("http-status-codes");
// const joi = require("joi");
const db = require("../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../utils/formatDate.js");
const validator = require("../utils/validator.js");

// const Op = db.Sequelize.Op;

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
    const { name, lastName, phone, email } = await validator.validatePostAccountInfo(req.body);

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
      extraDataUser.userMobile = true;
      extraDataUser.createdAt = dateNow;
      extraDataUser.updatedAt = dateNow;

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
    } = await validator.validatePostAccountFullLogin(req.body);
    
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

    const { name, lastName, residenceAddress, phone } =
      await validator.validatePostAccountUpdateUser(req.body);

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