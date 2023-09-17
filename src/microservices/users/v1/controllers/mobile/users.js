const { StatusCodes } = require("http-status-codes");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const db = require("../../../../../models/index.js");
const firebase = require("../../../../../utils/firebaseAdmin.js");
const validator = require("../../../utils/validators/mobile/users.js");
const { checkIfExists } = require("../../../utils/accessCheck.js");
// const Op = db.Sequelize.Op;

const uploadsFolder = path.join('..', '..', 'uploads', 'private'); // TODO: transform in env var; ask Esteban.

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
    };
    const extraDataUser = {
      clientId: clientId,
      loginPhase: "baseLogin",
      disabled: false,
      userMobile: true,
      emailVerified: null,
    };

    await db.User.create({ ...dataUser, ...extraDataUser });

    return res.status(StatusCodes.CREATED).json(dataUser);
  } catch (error) {
    // console.error("account postAccountInfo could not be created/updated: ", error.message);
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
    } = await validator.vPostAccountFullLogin(JSON.parse(req.body.info));

    const dataUser = {
      documentTypeId,
      document,
      address,
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
        message: `The user in baseLogin does not exist`,
      };
    }

    const pdfFile = await validator.vfileFullLogin(req.file);
    // const folder = "uploads/users/mobile/public_service_receipt";
    // const folder = "uploads";
    const endpoint = "mobileUsersPublicServiceReceipt";
    const uploadDir = path.join(uploadsFolder, endpoint);
    const filename = uuidV4() + path.extname(pdfFile.originalname);
    const host = req.get("host");
    const imageUri = `${req.protocol}://${host}/api/web/v1/users/file_download/${endpoint}/${filename}`;

    const filepath = path.join(uploadDir, filename);
    await checkIfExists(uploadDir, true);
    await fs.writeFile(filepath, pdfFile.buffer);

    const resultUpdate = await userInDb.update(
      {
        ...dataUser,
        serviceReceiptUri: imageUri,
        loginPhase: "inVerification",
      },
      { transaction }
    );

    // notify the administrator
    const dataNotif = {
      type: "user-inVerification",
      referenceId: resultUpdate.id,
      tableName: "Users",
      message: "",
    };
    await db.AdminNotification.create(dataNotif);
    await transaction.commit();

    return res.status(StatusCodes.OK).json({ ...dataUser, file: imageUri });
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
      where: { clientId },
    });
    
    const UserInFirebase = await firebase.getUserByClientId(clientId);
    if (userInDb === null && UserInFirebase.uid) {
      return res.status(StatusCodes.OK).json({
        loginPhase: "notRegistered",
        userInfo: null,
      });
    }

    if (UserInFirebase.status) {
      throw {
        status: UserInFirebase.status,
        message: UserInFirebase.message,
      };
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

    const UserInFirebase = await firebase.getUserByClientId(clientId);
    if (userInDb === null && UserInFirebase.uid) {
      return res.status(StatusCodes.OK).json({
        loginPhase: "notRegistered",
      });
    }

    if (UserInFirebase.status) {
      throw {
        status: UserInFirebase.status,
        message: UserInFirebase.message,
      };
    }

    const { loginPhase } = userInDb.dataValues;

    return res.status(StatusCodes.OK).send({
      loginPhase,
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
    // console.info("req.file: ", req.file);
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
        message: `The user in fullLogin does not exist`,
      };
    }

    await userInDb.update(dataUser);

    return res.status(StatusCodes.OK).json(dataUser);
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
