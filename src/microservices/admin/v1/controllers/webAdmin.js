const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const firebase = require("../../utils/firebaseAdmin.js");
const validator = require("../../utils/adminsValidator.js");
// const firebaseAppWeb = require("../../../utils/firebaseAppWeb.js");

/**
 * Generates a (random) string of length n.
 * @param {integer} length - String length.
 * @return {string} string (random).
 */
function generateSecureRandomString(length) {
  try {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error("Length must be a positive integer");
    }
  } catch (error) {
    console.error("Error capturado:", error.message);
    return null;
  }
  let result = "";
  // const validChars =
  //   "!#%*,-./0123456789:=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz";
  const validChars =
    ".0123456789:=@ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  const charactersLength = validChars.length;
  // const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i = 1) {
    // result = validChars.charAt(Math.floor(Math.random() * charactersLength));
    // result = validChars.charAt(bytes[i] % charactersLength);
    result = validChars.charAt(crypto.randomInt(0, charactersLength));
  }
  return result;
}

/**
 * Create a admin
 * @param {object} req - Object containing name, lastName, email, documentTypeId, document
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, lastName, email, documentTypeId, document } =
      await validator.vWebPostRegister(req.body);

    // Create the user in firebase and return clientId
    const dataUser = {
      displayName: `${name} ${lastName}`,
      password: "123456",
      // password: generateSecureRandomString(16),
      email,
    };
    const resCreate = await firebase.createUser(dataUser);

    if (resCreate.uid.status) {
      throw {
        status: resCreate.uid.status,
        message: resCreate.uid.detail,
      };
    }

    const dataQuery = {
      clientId: resCreate.uid,
      name,
      lastName,
      email,
      documentTypeId,
      document,
      disabled: false,
      userMobile: false,
      loginPhase: null,
      emailVerified: resCreate.emailVerified,
    };

    const userInDb = await db.User.create(dataQuery);
    // const sendEmail = await firebase.passwordReset(dataUser.email);
    const sendEmail = await firebase.emailVerification(dataUser.email);

    if (sendEmail.status) {
      throw {
        status: sendEmail.status,
        message: sendEmail.detail,
      };
    }
    return res.status(StatusCodes.CREATED).json({ meta: null, data: userInDb });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add role an admin
 * @param {object} req - Object containing the id, roleId
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAddRole = async (req, res, next) => {
  try {
    const { id, roleId } = await validator.vWebPostAddRole(req.body);
    const adminInDb = await db.User.findByPk(id);

    // ! Pendiente: Consultar la tabla roles
    const role = "super_master_user";
    await firebase.addCustomClaim(clientId, role);

    const resultUpdate = await adminInDb.update(roleId);

    return res
      .status(StatusCodes.CREATED)
      .json({ meta: null, data: resultUpdate });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update admin
 * @param {object} req - Object containing the name, lastName, documentTypeId, document
 * @return {object} Response contains: statuscode (integer), json (objeto): data admin, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, lastName, documentTypeId, document } =
      await validator.vWebPostEdit(req.body);

    const dataQuery = {
      name,
      lastName,
      documentTypeId,
      document,
    };

    const adminInDb = await db.User.findByPk(id);

    if (adminInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The admin does not exist`,
      };
    }

    const resultUpdate = await adminInDb.update(dataQuery);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("admin could not be updated: ", error.message);
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
 * Get all admins
 * @return {object} Response contains: statuscode (integer), json (objeto): data admins. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    // ! Pendiente filtrar por tipo de admin role
    const adminsInDb = await db.User.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (adminsInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no admins registered in the database",
      };
    }
    if (adminsInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(adminsInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: adminsInDb.count,
        totalPages: totalPages,
      },
      data: adminsInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("document types could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get admin by id
 * @return {object} Response contains: statuscode (integer), json (objeto): data admin. Or if there's error, json (objeto): status, code, detail
 */
exports.getOneById = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOneById({
      id: parseInt(req.params.id),
    });

    const adminInDb = await db.User.findByPk(id);

    if (adminInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Admin information could not be retrieved",
      };
    }

    return res.status(StatusCodes.OK).send({ meta: null, data: adminInDb });
  } catch (error) {
    // console.error("Admin could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Delete an admin
 * @return {object} Response contains: statuscode (integer), json (objeto): data admin. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const adminInDb = await db.User.findByPk(id);

    if (adminInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The admin does not exist`,
      };
    }

    // ! Pendiente: Verificar que el usuario admin no este siendo usado (fk) en otras tablas
    await adminInDb.destroy();

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: { id } });
  } catch (error) {
    // console.error("admin could not be updated: ", error.message);
    return next(error);
  }
};

/**
 * Send mail to allow admin user to create (reset) his password
 * @param {object} req - Object containing the code, name, abbreviation
 * @return {object} Response contains: statuscode (integer), json (objeto): data admin, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postSendMailResetPasswd = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostResetPasswd(req.body);
    const adminInDb = await db.User.findByPk(id);

    if (adminInDb == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested admin with id ${update.id} does not exist.`,
      };

    // const resultSend = await firebaseAppWeb.passwordResetEmail(adminInDb.email);
    const resultSend = await firebase.passwordReset(adminInDb.email);
    return res
      .status(StatusCodes.CREATED)
      .json({ meta: null, data: resultSend });
    // .json({ meta: null, data: {email: adminInDb.email} });
  } catch (error) {
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
