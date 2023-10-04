const { StatusCodes } = require("http-status-codes");
// const { Sequelize } = require("sequelize");
const crypto = require("crypto");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/transportCompanies.js");

/**
 * Create an Api Key
 * @param {object} req - Object containing the date (expiration)
 * @return {object} Response contains: statuscode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postCreateApiKey = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id", "clientId"],
      include: [
        {
          model: db.UserApiKey,
          attributes: ["id"],
          required: false,
        },
      ],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const { date } = await validator.vWebPostApiKey(req.body);
    // This key could be stored in the db, if you wish to verify the authenticity of the data (eg, createdBy.clientId)
    const secret = crypto.randomBytes(128).toString("hex");
    const apiKey = crypto.createHmac("sha512", secret).update(createdBy.clientId).digest("hex");

    if (!Array.isArray(createdBy.dataValues.UserApiKeys) || createdBy.dataValues.UserApiKeys.length === 0) {
      // Create
      await db.UserApiKey.create({
        userId: createdBy.id,
        module: "TRANSPORTROUTES",
        key: apiKey,
        expirationAt: date,
      });
    } else {
      // Renovate
      await db.UserApiKey.destroy({ where: { id: createdBy.dataValues.UserApiKeys[0].id } });
      await db.UserApiKey.create({
        userId: createdBy.id,
        module: "TRANSPORTROUTES",
        key: apiKey,
        expirationAt: date,
      });
    }   

    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        apiKey,
        date,
      },
    });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Create a transport company
 * @param {object} req - Object containing the name, nit, phone, siteUri, description, imageUri
 * @return {object} Response contains: statuscode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
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

    const dataQuery = {
      createdBy: createdBy.id,
      name,
      description,
      imageUri,
      nit,
      phone,
      siteUri,
    };

    const result = await db.TransportCompany.create(dataQuery);
    delete result.dataValues.createdBy;
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a transport company
 * @param {object} req - Object containing the id, name, nit, phone, siteUri, description, imageUri
 * @return {object} Response contains: statuscode (integer), json (transport company object updated) if 200OK. Or if there's error, json (object): status, code, detail
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

    const dataQuery = {
      id,
      name,
      description,
      imageUri,
      nit,
      phone,
      siteUri,
    };

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

    const resultUpdate = await companyInDb.update(dataQuery);
    delete resultUpdate.dataValues.createdBy;
    delete resultUpdate.dataValues.deletedAt;

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
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
 * Get the data of transport company - profile 
 * @return {object} Response contains: statuscode (integer), json (object): transport company data. Or if there's error, json (object): status, code, detail
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
      id: parseInt(req.params.id),
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
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
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
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
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

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not transport companies registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(companiesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: totalPages,
      },
      data: companiesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Transport companies could not be recovered: ", error.message);
    return next(error);
  }
};
