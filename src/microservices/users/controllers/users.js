const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const db = require("../../../models/index.js");
const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../utils/formatDate.js");
// const Op = db.Sequelize.Op;

// ! Verificar formato de res: Response contains: statuscode (integer), json (objeto): message

/**
 * New user registration, all login must be done through firebase so additional account data is registered and the user is linked in firebase with the clientId.
 * @param {object} req - Object containing the clientId, name, lastName, phone, email
 * @return {object} Response contains: statuscode (integer), json (objeto): code, msg, data.
 */
exports.postAccountInfo = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "clientId is missing",
      });
    }

    // ! Evitar la inyeccion de codigo SQL
    const { name, lastName, phone, email } = req.body;
    const date = formatDate(new Date());
    const dataUser = {
      name,
      lastName,
      phone,
      email,
    };
    let extraDataUser = {}

    // Upload Case - loginPhase="notRegistered"
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
      extraDataUser.createdAt = date;
      extraDataUser.updatedAt = date;

      await db.User.create(
        { ...dataUser, ...extraDataUser },
        { transaction: transactionSequelize }
      );
      await transactionSequelize.commit();

      return res.status(StatusCodes.OK).json(dataUser);
    }

    // ------------------------------------------
    // Updates Case - loginPhase="baseLogin"
    // ! Validar los campos que son requeridos - Monday
    const data = joi.object({
      name: joi.string(),
      lastName: joi.string(),
      phone: joi.string(),
      // ! HU-B1 Monday - Solo el email es requerido
      email: joi.string().email().required(),
    });

    const { error } = data.validate(req.body);
    if (error) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }

    extraDataUser.loginPhase = "baseLogin";
    extraDataUser.disabled = false;
    extraDataUser.updatedAt = date;

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
    await transactionSequelize.rollback();
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    console.error(
      "account postAccountInfo could not be created/updated: ",
      error.message
    );
    return next(error);
  }
};

/**
 * Update a user (existing in db) with missing information
 * @param {object} req - Object containing: documentType, documentNumber, birthDate, residenceAddress, serviceReceipt (file)
 * @return {object} Response contains: statuscode (integer), json (objeto): code, msg, data.
 */
exports.accountFullLogin = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();
  try {
    // console.info("req.file: ", req.file);
    const clientId = res.locals.uid;

    if (!clientId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "clientId is missing" });
    }

    const accountFullLoginSchema = joi.object({
      documentType: joi.string().required(),
      numberDocument: joi.string().required(),
      birthDate: joi.date().required(),
      residenceAddress: joi.string().required(),
    });

    const { error } = accountFullLoginSchema.validate(req.body);
    if (error) {
      await transactionSequelize.rollback();
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: error.message });
    }

    // ! Quitar serviceReceipt, o bueno, este se va a manejar con FirebaseStorage
    
    const { documentType, numberDocument, birthDate, residenceAddress } = req.body

    const dataUser = {
      documentType,
      numberDocument,
      birthDate,
      residenceAddress,
      // serviceReceipt: req.file.originalname,
      loginPhase: "inVerification",
      // ! Añadir timestamp de update?
    };

    const resultUpdate = await db.User.update(
      dataUser,
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
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "invalid input" });
    }
    await transactionSequelize.commit();
    return res.status(StatusCodes.OK).json({ message: "successful operation" });
  } catch (error) {
    await transactionSequelize.rollback();
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    console.error("account full_login could not be retrieved: ", error);
    return next(error);
  }
};

/**
 * Gets the user information and the loginPhase
 * @return {object} Response contains: statuscode (integer), json (objeto): code, msg, data.
 */
exports.getAccountInfo = async (req, res, next) => {
  // ! un usuario incognito tiene clienteId?
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "clientId is missing" });
    }

    const userInDb = await db.User.findOne({
      where: { clientId },
    });
    // let responseBody = {
    //   data: {
    //     loginPhase: "",
    //     // ! Error {}
    //     userInfo: {},
    //   },
    // };
    
    // ! Si algun campo no existe, se devuelve un objeto null ó ""?
    if (userInDb === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "user information could not be retrieved" });
      // res.status(StatusCodes.OK).send(responseBody);
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
    // return res.status(StatusCodes.OK).send(responseBody);
  } catch (error) {
    console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};

/**
 * Gets the user loginPhase
 * @return {object} Response contains: statuscode (integer), json (objeto): code, msg, data.
 */
exports.getAccountLoginPhase = async (req, res, next) => {
  // ! un usuario incognito tiene clienteId?
  try {
    const clientId = res.locals.uid;

    if (!clientId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "clientId is missing" });
    }

    const userInDb = await db.User.findOne({
      where: { clientId },
    });
    // let responseBody = {
    //   data: {
    //     loginPhase: "",
    //     // ! Error {}
    //     userInfo: {},
    //   },
    // };

    // ! Si algun campo no existe, se devuelve un objeto null ó ""?
    if (userInDb === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "user information could not be retrieved" });
      // res.status(StatusCodes.OK).send(responseBody);
    }

    const { loginPhase } = userInDb.dataValues;

    return res.status(StatusCodes.OK).send({
      loginPhase,
    });
    // return res.status(StatusCodes.OK).send(responseBody);
  } catch (error) {
    console.error("account info could not be retrieved: ", error.message);
    return next(error);
  }
};
