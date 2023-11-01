const { StatusCodes } = require("http-status-codes");
const { randomInt } = require("crypto");
const { Op } = require("sequelize");
const db = require("../../../../models/index.js");
const firebase = require("../../../../utils/firebaseAdmin.js");
const validator = require("../../utils/adminsValidator.js");
const mailService = require("../../../../utils/sendMail.js");
const msURLS = require("../../../../config/microservices_urls.json");
const urlFront = msURLS.front;

/**
 * Generates a (random) string of length n.
 * @param {integer} length - String length.
 * @return {string} string (random).
 */
function generateSecureRandomString(length) {
  try {
    try {
      if (!Number.isInteger(length) || length <= 0) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          detail: `Error sending mail: Length must be a positive integer`,
          code: "Internal Server Error",
        };
      }
    } catch (error) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error sending mail: ${error.message}`,
        code: "Internal Server Error",
      };
    }
    let result = "";
    // const validChars =
    //   "!#%*,-./0123456789:=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz";
    const validChars = ".0123456789@ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    const charactersLength = validChars.length;
    // const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i += 1) {
  
      // result += validChars.charAt(Math.floor(Math.random() * charactersLength));
      // result += validChars.charAt(bytes[i] % charactersLength);
      result += validChars.charAt(randomInt(0, charactersLength));
    }
    return result;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending mail: ${error.message}`,
      code: "Internal Server Error",
    };
  }
}

/**
 * Send the invitation email along with the credentials
 * @param {object} req - Object containing name, lastName, email, documentTypeId, document
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
async function mailInvitationVerification(dataUser, tokenEmailVerified, clientId) {
  try {
    const linkVerification = `${urlFront}/confirmation?token=${tokenEmailVerified}&ref=${clientId}`;
    // const linkLogin = `${urlFront}/login`;

    if (linkVerification) {
      const data = {
        to: dataUser.email,
        subject: "Invitación AppMoviliad Cali",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
                <h2 style="color: #007BFF;">¡Bienvenido a AppMovilidad Cali!</h2>
                <p>Hola ${dataUser.displayName},</p>
                <p>Te invitamos a unirte a la plataforma de movilidad de la Ciudad de Cali, Colombia. Para comenzar, es importante que verifiques tu correo electrónico. Haz clic en el siguiente enlace para hacerlo:</p>
                <a href="${linkVerification}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px;">Verificar Correo</a>
                <p>Una vez verificado, podrás acceder a la plataforma y podrás cambiar la contraseña que esta a continuación. Luego podrás acceder a todos los módulos de la aplicación.</p>
                <h3>Tu usuario y contraseña son:</h3>
                <ul>
                    <li><strong>Usuario:</strong> ${dataUser.email}</li>
                    <li><strong>Contraseña:</strong> ${dataUser.password}</li>
                </ul>
                <p>¡Esperamos que disfrutes de la plataforma!</p>
                <p>Saludos,<br>Equipo de AppMovilidad Cali</p>
            </div>
       `,
      };
      const resSend = await mailService.sendMail(data);
      return resSend;
    } else {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error sending mail: ${error.message}`,
        code: "Internal Server Error",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending mail: ${error.message}`,
      code: "Internal Server Error",
    };
  }
}

/**
 * Create a admin
 * @param {object} req - Object containing name, lastName, email, documentTypeId, document
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { name, lastName, email, documentTypeId, document } =
      await validator.vWebPostRegister(req.body);

    const tokenEmailVerified = generateSecureRandomString(100);
    if (tokenEmailVerified.status) {
      throw {
        status: tokenEmailVerified.status,
        message: tokenEmailVerified.detail,
      };
    }
    const passwd = generateSecureRandomString(12);
    // const passwd = "123456";
    if (passwd.status) {
      throw {
        status: passwd.status,
        message: passwd.detail,
      };
    }

    // Create the user in firebase and return clientId
    const dataUser = {
      displayName: `${name} ${lastName}`,
      password: passwd,
      email,
    };

    const resCreate = await firebase.createUser(dataUser);
    if (resCreate.status) {
      throw {
        status: resCreate.status,
        message: resCreate.detail,
      };
    }

    const userInDb = await db.User.create(
      {
        clientId: resCreate.uid,
        name,
        lastName,
        email,
        documentTypeId,
        document,
        disabled: false,
        userMobile: false,
        loginPhase: null,
        emailVerified: null,
        tokenEmailVerified,
        passwdReset: true,
      },
      { transaction }
    );

    // The following two options do not send the mail, the link is received (this link redirects the user to a Firebase interface), and must be sent
    // const link = await firebase.generateLinkPasswordReset(email, urlFront);
    // const link = await firebase.generateLinkEmailVerification(email, urlFront);

    const sendEmail = await mailInvitationVerification(
      dataUser,
      tokenEmailVerified,
      Buffer.from(userInDb.dataValues.clientId)
        .toString("base64")
        .replace("+", "-")
        .replace("/", "_")
        .replace(/=+$/, "")
    );

    if (sendEmail.status) {
      throw {
        status: sendEmail.status,
        message: sendEmail.detail,
      };
    }
    await transaction.commit();
    delete userInDb.dataValues.tokenEmailVerified;
    delete userInDb.dataValues.passwdReset;
    delete userInDb.dataValues.phone;
    delete userInDb.dataValues.address;
    delete userInDb.dataValues.serviceReceiptUri;
    delete userInDb.dataValues.loginPhase;
    delete userInDb.dataValues.pushDeviceToken;
    delete userInDb.dataValues.roleId;
    delete userInDb.dataValues.userMobile;
    delete userInDb.dataValues.disabled;
    return res
      .status(StatusCodes.CREATED)
      .json({
        meta: null,
        data: { name, lastName, email, documentTypeId, document },
      });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};

/**
 * Enter a new passwd
 * @param {object} req - Object containing passwd
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postSetPasswd = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { clientId, passwd } = await validator.vWebPostPasswd(req.body);

    const userInDb = await db.User.findOne({
      where: {
        clientId,
        passwdReset: true,
        emailVerified: {
          [Op.ne]: null,
        },
      },
      attributes: ["id", "clientId"],
    });

    if (userInDb == null || userInDb.clientId == null)
      throw {
        message: "The user not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };
    
    await userInDb.update({ passwdReset: false }, { transaction });

    const resUpdate = await firebase.setPasswd(clientId, passwd);
    if (resUpdate.status) {
      throw {
        status: resCreate.status,
        message: resCreate.detail,
      };
    }
    await transaction.commit();
    return res.status(StatusCodes.CREATED).json({ meta: null, data: { clientId } });
  } catch (error) {
    await transaction.rollback();
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
 * Add role an admin
 * @param {object} req - Object containing the id, roleId
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAddRole = async (req, res, next) => {
  try {
    const { id, roleId } = await validator.vWebPostAddRole(req.body);
    const adminInDb = await db.User.findByPk(id);

    // ! Pendiente: Consultar la tabla roles
    const role = "super_master_user";
    await firebase.addCustomClaim(clientId, role);

    await adminInDb.update({ roleId });

    return res
      .status(StatusCodes.CREATED)
      .json({ meta: null, data: { id, roleId } });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update admin
 * @param {object} req - Object containing the name, lastName, documentTypeId, document
 * @return {object} Response contains: statusCode (integer), json (objeto): data admin, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, lastName, documentTypeId, document } =
      await validator.vWebPostEdit(req.body);

    const adminInDb = await db.User.findOne({
      where: {
        id,
        userMobile: false
      },
    });

    if (adminInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user does not exist`,
      };
    }

    await adminInDb.update({
      name,
      lastName,
      documentTypeId,
      document,
    });
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id, name, lastName, documentTypeId, document },
    });
  } catch (error) {
    // console.error("admin could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = `The document number you are trying to update already exists in our records. Please use another one.`;
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Update a mobile user
 * @param {object} req.body - Object containing the id, name, lastName, documentTypeId, document, address, phone
 * @return {object} Response contains: statusCode (integer), json (objeto): data mobile user, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEditMobileUser = async (req, res, next) => {
  try {
    const update = await validator.vWebPostEditMobileUser(req.body);

    const userInDb = await db.User.findOne({
      where: {
        id: update.id,
        userMobile: true,
      },
    });
    delete update.id;

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user does not exist`,
      };
    }

    if (!isNaN(update.phone)) {
      update.phone = `+57${update.phone}`;
    }

    const resUpdate = await userInDb.update(update);
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: {
        ...update,
        id: resUpdate.dataValues.id,
      },
    });
  } catch (error) {
    // console.error("admin could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = `The document number you are trying to update already exists in our records. Please use another one.`;
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get all admins
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): data admins. Or if there's error, json (objeto): status, code, detail
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
      attributes: {
        exclude: [
          "tokenEmailVerified",
          "passwdReset",
          "serviceReceiptUri",
          "loginPhase",
          "pushDeviceToken",
          "userMobile",
          "deletedAt",
        ],
      },
    });

    let message = undefined;
    if (adminsInDb.count <= 0)
      message = "There are no users registered in the database";
    if (adminsInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: adminsInDb.count,
        totalPages: Math.ceil(adminsInDb.count / objPage.size),
      },
      data: adminsInDb.rows,
    });
  } catch (error) {
    // console.error("document types could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get admin by id
 * @param {integer} req.params.id - admin Id
 * @return {object} Response contains: statusCode (integer), json (objeto): data admin. Or if there's error, json (objeto): status, code, detail
 */
exports.getOneById = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOneById({
      id: req.params.id ? parseInt(req.params.id) : null,
    });

    const adminInDb = await db.User.findByPk(id, {
      attributes: {
        exclude: [
          "tokenEmailVerified",
          "passwdReset",
          "serviceReceiptUri",
          "loginPhase",
          "pushDeviceToken",
          "userMobile",
          "deletedAt",
        ],
      },
    });

    if (adminInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "User information could not be retrieved",
      };
    }

    return res.status(StatusCodes.OK).send({ meta: null, data: adminInDb });
  } catch (error) {
    // console.error("Admin could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Delete an web or mobile user 
 * @param {integer} req.body.id - user Id
 * @return {object} Response contains: statusCode (integer), json (objeto): user Id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const userInDb = await db.User.findByPk(id);

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user does not exist`,
      };
    }

    // ! Pendiente: Verificar que el usuario admin no este siendo usado (fk) en otras tablas
    // ! Pendiente: Ó realizar la eliminación en cascada
    if (userInDb.dataValues.userMobile === true) {
      await userInDb.update({ loginPhase: "notRegistered" });
    }
    await userInDb.destroy();

    return res.status(StatusCodes.OK).send({ meta: null, data: { id } });
  } catch (error) {
    // console.error("admin could not be updated: ", error.message);
    return next(error);
  }
};

/**
 * Send mail to allow admin user to create (reset) his password
 * @param {object} req - Object containing the code, name, abbreviation
 * @return {object} Response contains: statusCode (integer), json (objeto): data admin, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postSendMailResetPasswd = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostResetPasswd(req.body);
    const adminInDb = await db.User.findByPk(id);

    if (adminInDb == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested user with id ${update.id} does not exist.`,
      };

    const link = await firebase.generateLinkPasswordReset(adminInDb.email);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: link });
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
