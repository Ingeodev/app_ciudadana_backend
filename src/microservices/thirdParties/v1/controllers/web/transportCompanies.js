const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/transportCompanies.js");

/**
 * Create an Api Key
 * @param {object} req - Object containing the expirationAt (disabled) n companyId
 * @return {object} Response contains: statusCode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postCreateApiKey = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id", "clientId"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const { expirationAt, companyId } = await validator.vWebPostApiKey({
      // expirationAt: req.body.expirationAt,
      expirationAt: "2999-12-31",
      companyId: req.body.companyId,
    });

    const companyInDb = await db.TransportCompany.findByPk(companyId, {
      attributes: ["id"],
      paranoid: true,
    });

    if (companyInDb == null)
      throw {
        message: "Transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // This key could be stored in the db, if you wish to verify the authenticity of the data (eg, createdBy.clientId)
    const secret = crypto.randomBytes(128).toString("hex");
    const apiKey = crypto
      .createHmac("sha512", secret)
      .update(createdBy.clientId, companyInDb.id)
      .digest("hex");
    
    const newApiKey = {
      createdBy: createdBy.id,
      key: apiKey,
      expirationAt,
      tourismCompanyId: null,
      transportCompanyId: companyInDb.id,
    };

    // Validate if the company has an apiKey created
    const apiKeyInDb = await db.UserApiKey.findOne({
      where: {
        tourismCompanyId: null,
        transportCompanyId: companyInDb.id,
      },
      attributes: ["id"],
      paranoid: true,
    });

    if (apiKeyInDb == null) {
      // Create
      await db.UserApiKey.create(newApiKey);
    } else {
      // Renovate
      await apiKeyInDb.destroy();
      await db.UserApiKey.create(newApiKey);
    }

    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        apiKey,
        expirationAt,
        companyId: companyInDb.id,
      },
    });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "Please try again.";
      error.status = StatusCodes.INTERNAL_SERVER_ERROR;
    } 
    return next(error);
  }
};

/**
 * Get the apiKey (First 5 characters)
 * @param {integer} req.params.id - id of the company
 * @return {object} Response contains: statusCode (integer), json (object): tourism company data. Or if there's error, json (object): status, code, detail
 */
exports.getApiKey = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { companyId } = await validator.vWebGetApiKey({
      companyId: req.params.companyId ? parseInt(req.params.companyId) : null,
    });

    // Validate that the company belongs to the user
    const companyInDb = await db.TransportCompany.findByPk(companyId, {
      include: [
        {
          model: db.UserApiKey,
          where: { tourismCompanyId: null },
          attributes: ["key"],
          required: true,
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });

    if (companyInDb === null)
      throw {
        message: "Transport company does not have an api key created",
        status: StatusCodes.NOT_FOUND,
      };

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: { apiKey: String(companyInDb.UserApiKeys[0].key).substring(0, 5) + "*********" },
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Create a transport company
 * @param {object} req - Object containing the name, nit, phone, siteUri, description, imageUri
 * @return {object} Response contains: statusCode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const { name, description, imageUri, nit, phone, siteUri } = await validator.vWebPostRegister(req.body);

    const result = await db.TransportCompany.create({
      createdBy: createdBy.id,
      name,
      description,
      imageUri,
      nit,
      phone: `+57${phone}`,
      siteUri,
    });
    delete result.dataValues.createdBy;
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = `${error.errors[0].path} must be unique`;
      error.status = StatusCodes.BAD_REQUEST;
    }
    return next(error);
  }
};

/**
 * Update a transport company
 * @param {object} req - Object containing the id, name, nit, phone, siteUri, description, imageUri
 * @return {object} Response contains: statusCode (integer), json (transport company object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const {
      id,
      name,
      description,
      imageUri,
      nit,
      phone,
      siteUri,
    } = await validator.vWebPostEdit(req.body);

    // Validate that the company belongs to the user
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
    });

    if (companyInDb == null)
      throw {
        message: "Transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);

    const resultUpdate = await companyInDb.update({
      id,
      name,
      description,
      imageUri,
      nit,
      phone: `+57${phone}`,
      siteUri,
    });
    delete resultUpdate.dataValues.createdBy;
    delete resultUpdate.dataValues.deletedAt;

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = `${error.errors[0].path} must be unique`;
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get the data of transport company - profile 
 * @param {integer} req.params.id - id of the company
 * @return {object} Response contains: statusCode (integer), json (object): transport company data. Or if there's error, json (object): status, code, detail
 */
exports.getProfile = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id } = await validator.vWebGetProfile({
      id: req.params.id ? parseInt(req.params.id) : null,
    });

    // Validate that the company belongs to the user
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
      attributes: {
        exclude: ["createdBy", "deletedAt"],
      },
    });

    if (companyInDb == null)
      throw {
        message: "Transport company could not be retrieved",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);
    delete companyInDb.dataValues.createdBy;
    delete companyInDb.dataValues.deletedAt;

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: companyInDb,
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a transport company (soft delete)
 * @return {object} Response contains: statusCode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };
    
    const { id } = await validator.vWebPostDelete(req.body);
    const companyInDb = await db.TransportCompany.findByPk(id, {
      // where: {
      //   id,
      //   // // ! Pendiente: Validar permisos del usuario
      //   // createdBy: createdBy.id,
      // },
      attributes: ["id"],
      paranoid: true,
    });

    if (companyInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Transport company does not found`,
      };
    }

    await companyInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Get all transport companies 
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statusCode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const objPage = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const companiesInDb = await db.TransportCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      attributes: {
        exclude: ["createdBy","deletedAt"],
      },
    });

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no transport companies registered";
    if (companiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: Math.ceil(companiesInDb.count / objPage.size),
      },
      data: companiesInDb.rows,
    });
  } catch (error) {
    // console.error("Transport companies could not be recovered: ", error.message);
    return next(error);
  }
};
