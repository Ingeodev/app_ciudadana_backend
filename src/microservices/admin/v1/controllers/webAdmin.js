const { StatusCodes } = require("http-status-codes");
const { randomInt } = require("crypto");
const { v4: uuidV4 } = require("uuid");
const path = require("path");
const admin = require("firebase-admin");
const { Op, col } = require("sequelize");
const db = require("../../../../models/index.js");
const {
  createUser,
  deleteUser,
  addCustomClaim,
  generateLinkPasswordReset,
  setPasswd,
} = require("../../../../utils/firebaseAdmin.js");
const validator = require("../../utils/adminsValidator.js");
const mailService = require("../../../../utils/sendMail.js");
const msURLS = require("../../../../config/microservices_urls.json");
const urlFront = msURLS.front;
const { transformSavedUriToSend } = require("../../../../utils/uriTransformer.js");

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
 * @param {object} req - Object containing dataUser (email, displayName, password), tokenEmailVerified, clientId
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
  let wasCreated = false;
  let uid = "";
  try {
    const { name, lastName, email, documentTypeId, document } =
      await validator.vWebPostRegister(req.body);
    
    const findUserInDb = await db.User.findOne({
      where: {
        email
      },
      paranoid: true
    });

    if (findUserInDb !== null) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: `Email has been used previously.`,
      };
    }

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

    const resCreate = await createUser(dataUser);
    if (resCreate.status) {
      throw {
        status: resCreate.status,
        message: resCreate.detail,
      };
    }
    wasCreated = resCreate.wasCreated;
    uid = resCreate.uid;
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
    return res
      .status(StatusCodes.CREATED)
      .json({
        meta: null,
        data: { id: userInDb.dataValues.id, name, lastName, email, documentTypeId, document },
      });
  } catch (error) {
    await transaction.rollback();
    if (wasCreated) {
      await deleteUser(uid);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        error.message = "Document and documentType has been used previously.";
        error.status = StatusCodes.BAD_REQUEST;
    }
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

    const resUpdate = await setPasswd(clientId, passwd);
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
    await addCustomClaim(clientId, role);

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

    const adminInDb = await db.User.findOne({
      where: {
        id,
        userMobile: false
      },
      include: [
        {
          model: db.DocumentType,
          attributes: [],
          required: false,
        },
      ],
      attributes: [
        "name",
        "lastName",
        "email",
        "document",
        "documentTypeId",
        [col('"DocumentType"."name"'), "DocumentTypeName"],
      ],
      paranoid: true
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
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const userInDb = await db.User.findByPk(id);

    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user does not exist`,
      };
    }

    if (userInDb.dataValues.userMobile === true) {
      await userInDb.update({ loginPhase: "notRegistered" }, { transaction });
    }
    await userInDb.destroy({ transaction });
    await transaction.commit();
    return res.status(StatusCodes.OK).send({ meta: null, data: { id } });
  } catch (error) {
    await transaction.rollback();
    // console.error("admin could not be deleted: ", error.message);
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

    const link = await generateLinkPasswordReset(adminInDb.email);
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

/**
 * List all the PQRS requests with pagination and filters (radicado, status).
 * @return {object} Response contains: statusCode (integer), json (objeto): meta with pagination info and the PQRS data list.
 */
exports.getListAllPqrs = async (req, res, next) => {
  try {
    const filters = await validator.vWebPqrsGetList({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
      radicado: req.query.radicado,
      status: req.query.status,
    });
    const offset = (filters.number - 1) * filters.size;

    const where = {};
    if (filters.radicado) {
      where.radicado = { [Op.iLike]: `%${filters.radicado}%` };
    }

    // Latest status (and its timestamp) of each Pqrs.
    const latestStatusLiteral = `(SELECT ps.status FROM "PqrsStatuses" ps WHERE ps."pqrsId" = "Pqrs"."id" AND ps."deletedAt" IS NULL ORDER BY ps."createdAt" DESC LIMIT 1)`;
    const latestStatusDateLiteral = `(SELECT ps."createdAt" FROM "PqrsStatuses" ps WHERE ps."pqrsId" = "Pqrs"."id" AND ps."deletedAt" IS NULL ORDER BY ps."createdAt" DESC LIMIT 1)`;
    const responsesCountLiteral = `(SELECT COUNT(*) FROM "PqrsResponses" pr WHERE pr."pqrsId" = "Pqrs"."id" AND pr."deletedAt" IS NULL)`;

    if (filters.status) {
      where[Op.and] = [db.sequelize.literal(`${latestStatusLiteral} = '${filters.status}'`)];
    }

    const pqrsDb = await db.Pqrs.findAndCountAll({
      where,
      distinct: true,
      paranoid: true,
      order: [["createdAt", "DESC"]],
      offset,
      limit: filters.size,
      include: [
        {
          model: db.Dependency,
          attributes: ["name"],
          required: false,
        },
        {
          model: db.DocumentType,
          attributes: ["name"],
          required: false,
        },
      ],
      attributes: {
        exclude: ["deletedAt", "Dependency", "DocumentType"],
        include: [
          [db.sequelize.literal(latestStatusLiteral), "status"],
          [db.sequelize.literal(latestStatusDateLiteral), "statusDate"],
          [db.sequelize.literal(responsesCountLiteral), "responsesCount"],
          [db.sequelize.col('"Dependency"."name"'), "dependencyName"],
          [db.sequelize.col('"DocumentType"."name"'), "documentTypeName"],
        ],
      },
    });

    let message = undefined;
    if (pqrsDb.count <= 0)
      message = "There are no PQRS registered in the database.";
    if (pqrsDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = pqrsDb.rows.map((row) => {
      return {
        ...row.dataValues,
        Dependency: undefined,
        DocumentType: undefined,
      };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: filters.number,
        pageSize: filters.size,
        totalRecords: pqrsDb.count,
        totalPages: Math.ceil(pqrsDb.count / filters.size),
      },
      data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a PQRS by id with its statuses and responses.
 * @param {integer} req.params.id - PQRS id
 * @return {object} Response contains: statusCode (integer), json (objeto): pqrs detail with its responses.
 */
exports.getOnePqrs = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPqrsGetOne({
      id: req.params.id ? parseInt(req.params.id) : null,
    });

    const pqrsInDb = await db.Pqrs.findByPk(id, {
      paranoid: true,
      include: [
        {
          model: db.Dependency,
          attributes: ["name"],
          required: false,
        },
        {
          model: db.DocumentType,
          attributes: ["name"],
          required: false,
        },
        {
          model: db.PqrsStatus,
          attributes: ["id", "status", "createdAt"],
          required: false,
          order: [["createdAt", "ASC"]],
        },
        {
          model: db.PqrsResponse,
          attributes: ["id", "description", "fileUri", "createdAt"],
          required: false,
          include: [
            {
              model: db.User,
              as: "User",
              attributes: ["name", "lastName", "email"],
              required: false,
            },
          ],
        },
      ],
      attributes: { exclude: ["deletedAt"] },
    });

    if (pqrsInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "PQRS information could not be retrieved",
      };
    }

    const data = pqrsInDb.toJSON();
    data.Dependency = undefined;
    data.DocumentType = undefined;
    data.dependencyName = pqrsInDb.Dependency
      ? pqrsInDb.Dependency.dataValues.name
      : null;
    data.documentTypeName = pqrsInDb.DocumentType
      ? pqrsInDb.DocumentType.dataValues.name
      : null;

    if (Array.isArray(data.PqrsResponses)) {
      data.PqrsResponses = data.PqrsResponses.map((response) => {
        const values = { ...response };
        values.fileUri = transformSavedUriToSend(values.fileUri);
        values.responderName = response.User
          ? `${response.User.name || ""} ${response.User.lastName || ""}`.trim()
          : null;
        delete values.User;
        return values;
      });
    }

    return res.status(StatusCodes.OK).json({ meta: null, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Register a response for a PQRS request.
 * @return {object} Response contains: statusCode (integer), json (objeto): created response data.
 */
exports.postPqrsResponse = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const adminUser = await db.User.findOne({
      where: { clientId: res.locals.uid, userMobile: false, disabled: false },
      attributes: ["id"],
    });

    if (adminUser == null || adminUser.id == null)
      throw {
        message:
          "Requesting user is not allowed to respond PQRS or is not registered in the database yet.",
        status: StatusCodes.FORBIDDEN,
      };

    let parsed;
    try {
      parsed = JSON.parse(req.body.pqrs);
    } catch (parseError) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "The 'pqrs' field is not a valid JSON string.",
      };
    }

    const data = await validator.vWebPqrsRespond(parsed);

    const pqrsInDb = await db.Pqrs.findByPk(data.pqrsId, {
      attributes: ["id"],
      paranoid: true,
    });
    if (pqrsInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned PQRS does not exist.",
      };
    }

    let fileUri = null;
    if (req.file) {
      await validator.vFilePqrsResponse(req.file);
      const filename = uuidV4() + path.extname(req.file.originalname);
      const folder = "pqrsResponses";
      const bucket = admin.storage().bucket();
      await bucket.file(`${folder}/${filename}`).save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });
      fileUri = `${req.protocol}://${req.get("host")}/api/v1/file_management/download/${folder}/${filename}`;
    }

    const responseInDb = await db.PqrsResponse.create(
      {
        pqrsId: data.pqrsId,
        userId: adminUser.id,
        description: data.description,
        fileUri,
      },
      { transaction }
    );

    await db.PqrsStatus.create(
      {
        pqrsId: data.pqrsId,
        status: "ATENDIDA",
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        id: responseInDb.dataValues.id,
        pqrsId: responseInDb.dataValues.pqrsId,
        description: responseInDb.dataValues.description,
        fileUri: responseInDb.dataValues.fileUri,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};
