const { StatusCodes } = require("http-status-codes");
// const joi = require("joi");
const db = require("../../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../../middleware/formatDate.js");
const validator = require("../../../utils/validators/users/web.js");

// const Op = db.Sequelize.Op;

// TODO: -------------------------- Start - Endpoints copied from mobileController
/**
 * Create (loginPhase="notRegistered") or update (loginPhase="baseLogin") user's base information. All login must be done through firebase so additional account data is registered and the user is linked in firebase with the clientId.
 * @param {object} req - Object containing the name, lastName, phone, email
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountInfo = async (req, res, next) => {
  try {
    const clientId = res.locals.uid;
    // ! Validar los campos que son requeridos - Monday
    const { name, lastName, phone, email } = await validator.vPostAccountInfo(
      req.body
    );

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    // ! Evitar la inyeccion de codigo SQL
    const dataUser = {
      name,
      lastName,
      phone,
      email,
      clientId: clientId,
      loginPhase: "baseLogin",
      disabled: false,
      userMobile: false,
      createdAt: formatDate(new Date()),
    };

    const result = await db.User.create(dataUser);

    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: result,
    });
  } catch (error) {
    console.error(
      "account postAccountInfo could not be created/updated: ",
      error.message
    );
    return next(error);
  }
};

/**
 * Update a user (existing in db) with missing information, ie, when loginPhase="baseLogin"
 * @param {object} req - Object containing: documentTypeId, numberDocument, residenceAddress, serviceReceiptUri, siteUri
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountFullLogin = async (req, res, next) => {
  try {
    // console.info("req.file: ", req.file);
    const clientId = res.locals.uid;

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const {
      documentTypeId,
      numberDocument,
      residenceAddress,
      serviceReceiptUri,
      siteUri,
    } = await validator.vPostAccountFullLogin(req.body);

    const dataUser = {
      documentTypeId,
      numberDocument,
      residenceAddress,
      serviceReceiptUri,
      siteUri,
      loginPhase: "inVerification",
      updatedAt: formatDate(new Date()),
    };

    const userInDb = await db.User.findOne({
      where: {
        clientId,
        loginPhase: "baseLogin",
      },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user with clientId=${clientId} and loginPhase="baseLogin does not exist`,
      };      
    }

    const resultUpdate = await userInDb.update(dataUser);
    
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    console.error("account full_login could not be retrieved: ", error);
    
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
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const userInDb = await db.User.findOne({
      where: { clientId },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "user information could not be retrieved",
      };
    }

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: userInDb,
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
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const userInDb = await db.User.findOne({
      where: { clientId },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "user information could not be retrieved",
      };
    }

    const { loginPhase } = userInDb.dataValues;

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { loginPhase },
    });
  } catch (error) {
    console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};
/**
 * Update a user (existing in db) with missing information, ie, when loginPhase="fullLogin"
 * @param {object} req - Object containing: name, lastName, phone, residenceAddress
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountUpdateUser = async (req, res, next) => {
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const { name, lastName, phone, residenceAddress } =
      await validator.vPostAccountUpdateUser(req.body);

    const dataUser = {
      name,
      lastName,
      residenceAddress,
      phone,
      updatedAt: formatDate(new Date()),
    };

    const userInDb = await db.User.findOne({
      where: {
        clientId,
        loginPhase: "fullLogin",
      },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user with clientId=${clientId} and loginPhase="fullLogin" does not exist`,
      };
    }

    const resultUpdate = await userInDb.update(dataUser);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    console.error("account full_login could not be retrieved: ", error);
    
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
    const objPage = await validator.vGetUsersListAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 10,
    });

    const usersInDb = await db.User.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (usersInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The requested page does not exist",
      };
    }
    const totalPages = Math.ceil(usersInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: usersInDb.count,
        totalPages: totalPages,
      },
      data: usersInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("users could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Update the status of the users.disabled field (to false) for a user
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.postUsersUpdateDisabled = async (req, res, next) => {
  try {
    const { clientId } = await validator.vPostUsersUpdateDisabled(req.body);
    const dataUser = {
      disabled: true,
      deleteAt: formatDate(new Date()),
    };

    const userInDb = await db.User.findOne({
      where: {
        clientId
      },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user with clientId=${clientId} does not exist`,
      };
    }

    await userInDb.update(dataUser);
    
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { clientId }
    });
  } catch (error) {
    console.error("users could not be updated: ", error.message);
    return next(error);
  }
};

/**
 * Update the users.loginPhase="inVerification" to "fullLogin"
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.postUsersFullLogin = async (req, res, next) => {
  try {
    const { clientId } = await validator.vPostUsersUpdateLoginPhaseFullLogin(req.body);
    const dataUser = {
      loginPhase: "fullLogin",
      updatedAt: formatDate(new Date()),
    };

    const userInDb = await db.User.findOne({
      where: {
        clientId,
        loginPhase: "inVerification",
      },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user with clientId=${clientId} and loginPhase="inVerification" does not exist`,
      };
    }

    const result = await userInDb.update(dataUser);

    return res.status(StatusCodes.OK).json({
      meta: null,
      // data: { clientId },
      data: result,
    });
  } catch (error) {
    console.error("user could not be updated: ", error.message);
    return next(error);
  }
};
