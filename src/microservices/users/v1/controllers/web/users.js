const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require('sequelize');
// const joi = require("joi");
const db = require("../../../../../models/index.js");
const firebase = require("../../../../../utils/firebaseAdmin.js");
const validator = require("../../../utils/validators/web/users.js");

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
    // ! El email se podría obtener directamente desde el token
    const { name, lastName, phone, email } = await validator.vPostAccountInfo(
      req.body
    );

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const dataUser = {
      name,
      lastName,
      phone,
      email,
      clientId: clientId,
      loginPhase: "baseLogin",
      passwdReset: false,
      disabled: false,
      userMobile: false,
      emailVerified: null,
    };

    const result = await db.User.create(dataUser); 
    delete result.dataValues.clientId;
    delete result.dataValues.emailVerified;
    delete result.dataValues.tokenEmailVerified;
    delete result.dataValues.passwdReset;
    delete result.dataValues.address;
    delete result.dataValues.serviceReceiptUri;
    delete result.dataValues.pushDeviceToken;
    delete result.dataValues.roleId;
    delete result.dataValues.disabled;
    delete result.dataValues.loginPhase;
    delete result.dataValues.userMobile;
    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: result,
    });
  } catch (error) {
    // console.error( "account postAccountInfo could not be created/updated: ", error.message);
    return next(error);
  }
};

/**
 * Update a user (existing in db) with missing information, ie, when loginPhase="baseLogin"
 * @param {object} req - Object containing: documentTypeId, document, address, serviceReceiptUri
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountBaseLogin = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const {
      documentTypeId,
      document,
      address,
      serviceReceiptUri,
    } = await validator.vPostAccountFullLogin(req.body);

    const dataUser = {
      documentTypeId,
      document,
      address,
      serviceReceiptUri,
      loginPhase: "inVerification",
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

    const resultUpdate = await userInDb.update(dataUser, { transaction });

    // notify the administrator
    const dataNotif = {
      type: "user-inVerification",
      referenceId: resultUpdate.id,
      tableName: "Users",
      message: "",
    };
    await db.AdminNotification.create(dataNotif);
    await transaction.commit();
    delete resultUpdate.dataValues.clientId;
    delete resultUpdate.dataValues.emailVerified;
    delete resultUpdate.dataValues.tokenEmailVerified;
    delete resultUpdate.dataValues.passwdReset;
    delete resultUpdate.dataValues.pushDeviceToken;
    delete resultUpdate.dataValues.roleId;
    delete resultUpdate.dataValues.loginPhase;
    delete resultUpdate.dataValues.disabled;
    delete resultUpdate.dataValues.userMobile;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    await transaction.rollback();
    // console.error("account full_login could not be updated: ", error);    
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
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const userInDb = await db.User.findOne({
      limit: 1,
      where: { clientId },
      include: [{
          model: db.Role,
          attributes: [],
          required: false,
      }],
      attributes: {
          exclude: ["deletedAt"],
          include: [
              [Sequelize.col('"Role"."name"'), 'roleName'],
          ],
      },
    });

    const UserInFirebase = await firebase.getUserByClientId(clientId);
    if (userInDb === null && UserInFirebase.uid) {
      return res.status(StatusCodes.OK).json({
        meta: null,
        data: {
          loginPhase: "notRegistered",
          userInfo: null,
        },
      });
    } 

    if (UserInFirebase.status) {
      throw {
        status: UserInFirebase.status,
        message: UserInFirebase.message,
      };
    }
    
    delete userInDb.dataValues.clientId;
    delete userInDb.dataValues.tokenEmailVerified;
    delete userInDb.dataValues.address;
    delete userInDb.dataValues.serviceReceiptUri;
    delete userInDb.dataValues.pushDeviceToken;
    delete userInDb.dataValues.disabled;
    delete userInDb.dataValues.loginPhase;
    delete userInDb.dataValues.userMobile;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: userInDb,
    });
  } catch (error) {
    // console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};

/**
 * Gets the user loginPhase
 * @return {object} Response contains: statuscode (integer), json (objeto): data. Or if there's error, json (objeto): status, code, detail
 */
exports.getAccountLoginPhase = async (req, res, next) => {
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

    const UserInFirebase = await firebase.getUserByClientId("clientId");
    if (userInDb === null && UserInFirebase.uid) {
      return res.status(StatusCodes.OK).json({
        meta: null,
        data: {
          loginPhase: "notRegistered",
        },
      });
    }

    if (UserInFirebase.status) {
      throw {
        status: UserInFirebase.status,
        message: UserInFirebase.message,
      };
    }

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
    // console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};
/**
 * Update a user (existing in db) with missing information, ie, when loginPhase="fullLogin"
 * @param {object} req - Object containing: name, lastName, phone, address
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAccountFullLogin = async (req, res, next) => {
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "clientId is missing",
      };
    }

    const { name, lastName, phone, address } =
      await validator.vPostAccountUpdateUser(req.body);

    const dataUser = {
      name,
      lastName,
      address,
      phone,
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
    delete resultUpdate.dataValues.clientId;
    delete resultUpdate.dataValues.emailVerified;
    delete resultUpdate.dataValues.tokenEmailVerified;
    delete resultUpdate.dataValues.passwdReset;
    delete resultUpdate.dataValues.address;
    delete resultUpdate.dataValues.serviceReceiptUri;
    delete resultUpdate.dataValues.pushDeviceToken;
    delete resultUpdate.dataValues.roleId;
    delete resultUpdate.dataValues.disabled;
    delete resultUpdate.dataValues.loginPhase;
    delete resultUpdate.dataValues.userMobile;

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("account full_login could not be retrieved: ", error);

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
 * Get web users or app users
 * @param {object} req.query - Object containing the number, size, webUser, n mobileUser
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.getUsersListByDevice = async (req, res, next) => {
  try {
    const objPage = await validator.vGetUsersListByDevice({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
      webUser: req.query.webUser ? req.query.webUser : null,
      mobileUser: req.query.mobileUser ? req.query.mobileUser : null,
    });

    let attributes = {};
    let include = [];
    let isMobileUser = false;

    if (objPage.webUser) {
      (include = [
        // {
        //   model: db.DocumentType,
        //   attributes: [],
        //   required: false,
        // },
        {
          model: db.Role,
          attributes: [],
          required: false,
        },
      ]),
        (attributes.exclude = [
          "phone",
          "address",
          "serviceReceiptUri",
          "loginPhase",
          "userMobile",
          "updatedAt",
          "deletedAt",
          "pushDeviceToken",
          "tokenEmailVerified",
          "passwdReset",
        ]);
      attributes.include = [
        "id",
        "clientId",
        "name",
        "lastName",
        "email",
        "documentTypeId",
        "document",
        // [Sequelize.col('"DocumentType"."name"'), "DocumentTypeName"],
        "disabled",
        "createdAt",
        "roleId",
        [Sequelize.col('"Role"."name"'), "roleName"],
        "emailVerified",
      ];
    } else {
      isMobileUser = true;
      attributes.exclude = [
        "document",
        "documentTypeId",
        "disabled",
        "userMobile",
        "updatedAt",
        "deletedAt",
        "roleId",
        "tokenEmailVerified",
        "passwdReset",
        "emailVerified",
      ];
      attributes.include = [
        "id",
        "clientId",
        "name",
        "lastName",
        "email",
        "phone",
        "address",
        "serviceReceiptUri",
        "loginPhase",
        "pushDeviceToken",
      ];
    }

    const usersInDb = await db.User.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      where: {
        userMobile: isMobileUser,
      },
      include,
      attributes,
    });

    let message = undefined;
    if (usersInDb.count <= 0)
      message = "There are no Users registered";
    if (usersInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    // Additional processing to remove the object from documentType
    // const adjustedUsers = usersInDb.rows.map((user) => {
    //   const userData = user.toJSON(); // Convierte el modelo Sequelize a un objeto regular
    //   delete userData.DocumentType; // Elimina la propiedad DocumentType
    //   return userData;
    // });

    const responseCustom = {
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: usersInDb.count,
        totalPages: Math.ceil(usersInDb.count / objPage.size),
      },
      // data: adjustedUsers,
      data: usersInDb.rows,
    };

    if (isMobileUser) {
      const modifiedUsers = usersInDb.rows.map((user) => {
        const userJSON = user.toJSON();

        if (userJSON.pushDeviceToken && userJSON.pushDeviceToken.length > 5) {
          userJSON.pushDeviceToken = userJSON.pushDeviceToken.substring(0, 5) + "*********";
        }

        if (userJSON.phone && userJSON.phone.length > 7) {
          userJSON.phone = userJSON.phone.substring(0, 7) + "***";
        }

        return userJSON;
      });
      return res.status(StatusCodes.OK).send({
        ...responseCustom,
        data: modifiedUsers
      });
    }

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("users could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Changes the boolean value of User.disabled. Only web Users
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
exports.postUsersStatus = async (req, res, next) => {
  try {
    const { clientId, disabled } = await validator.vPostUsersStatus(req.body);
    const userInDb = await db.User.findOne({
      where: {
        clientId,
        userMobile: false
      },
    });

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user does not exist`,
      };
    }

    const result = await userInDb.update({ disabled });
    delete result.dataValues.emailVerified;
    delete result.dataValues.tokenEmailVerified;
    delete result.dataValues.passwdReset;
    delete result.dataValues.address;
    delete result.dataValues.phone;
    delete result.dataValues.serviceReceiptUri;
    delete result.dataValues.pushDeviceToken;
    delete result.dataValues.roleId;
    delete result.dataValues.loginPhase;
    delete result.dataValues.userMobile;

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: result,
    });
  } catch (error) {
    // console.error("users could not be deleted: ", error.message);
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
    delete result.dataValues.emailVerified;
    delete result.dataValues.tokenEmailVerified;
    delete result.dataValues.passwdReset;
    delete result.dataValues.address;
    delete result.dataValues.serviceReceiptUri;
    delete result.dataValues.pushDeviceToken;
    delete result.dataValues.roleId;
    delete result.dataValues.userMobile;
    delete result.dataValues.disabled;

    return res.status(StatusCodes.OK).json({
      meta: null,
      // data: { clientId },
      data: result,
    });
  } catch (error) {
    // console.error("user could not be updated: ", error.message);
    return next(error);
  }
};
