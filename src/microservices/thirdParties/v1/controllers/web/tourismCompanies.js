const { StatusCodes } = require("http-status-codes");
const { literal, col } = require("sequelize");
const crypto = require("crypto");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/tourismCompanies.js");

/**
 * Checks whether an TourismCategory ID exists and refers to an existing category.
 * @param {number} categoryId The ID of an TourismCategory, or ``null``.
 * @returns {boolean} `true` if the `categoryId` is `null` or exists in the TourismCategory table. ``false`` otherwise.
 */
const checkCategoryExists = async (categoryId) => {
  if (categoryId != null) {
    const categoryExists = await db.TourismCategory.findByPk(categoryId, { attributes: ['id'], paranoid: true });
    if (categoryExists == null)
      return false;
  }
  return true;
};

/**
 * Create an Api Key
 * @param {object} req - Object containing the date (expiration) n companyId
 * @return {object} Response contains: statusCode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postCreateApiKey = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id", "clientId"],
      // include: [
      //   {
      //     model: db.UserApiKey,
      //     attributes: ["id"],
      //     required: false,
      //   },
      // ],
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

    const companyInDb = await db.TourismCompany.findByPk(companyId, {
      attributes: ["id"],
      paranoid: true,
    });

    if (companyInDb == null)
      throw {
        message: "Tourism company not found",
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
      tourismCompanyId: companyInDb.id,
      transportCompanyId: null,
    };

    // Validate if the company has an apiKey created
    const apiKeyInDb = await db.UserApiKey.findOne({
      where: {
        tourismCompanyId: companyInDb.id,
        transportCompanyId: null,
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
    const companyInDb = await db.TourismCompany.findByPk(companyId, {
      include: [
        {
          model: db.UserApiKey,
          where: { transportCompanyId: null },
          attributes: ["key"],
          required: true,
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });

    if (companyInDb === null)
      throw {
        message: "Tourism company does not have an api key created",
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
 * Create a tourism company
 * @param {object} req - Object containing the name, nit, categoryId, description, address, phone, imageUri, siteUri, lat, lon
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

    const {
      name,
      nit,
      categoryId,
      description,
      address,
      phone,
      imageUri,
      siteUri,
      lat,
      lon,
    } = await validator.vWebPostRegister(req.body);

    if (!(await checkCategoryExists(categoryId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned category does not exist.",
      };

    const result = await db.TourismCompany.create({
      createdBy: createdBy.id,
      name,
      nit,
      categoryId,
      description,
      address,
      phone: `+57${phone}`,
      imageUri,
      siteUri,
      geolocation: literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    });

    const data = {
      ...result.dataValues,
      deletedAt: undefined,
      geolocation: undefined,
      createdBy: undefined,
      lat: result.dataValues.geolocation.coordinates[1],
      lon: result.dataValues.geolocation.coordinates[0],
    };

    return res.status(StatusCodes.CREATED).json({ meta: null, data: data });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a tourism company
 * @param {object} req - Object containing the id, name, nit, categoryId, description, address, phone, imageUri, siteUri, lat, lon
 * @return {object} Response contains: statusCode (integer), json (tourism company object updated) if 200OK. Or if there's error, json (object): status, code, detail
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

    const update = await validator.vWebPostEdit(req.body);
    let lat = undefined;
    let lon = undefined;

    if (!isNaN(update.categoryId))
      if (!await checkCategoryExists(update.categoryId))
        throw {
          status: StatusCodes.NOT_FOUND,
          message: 'The assigned category does not exist.',
        };

    // Validate that the company belongs to the user
    const companyInDb = await db.TourismCompany.findByPk(update.id);
    // const companyInDb = await db.TourismCompany.findOne({
    //   where: {
    //     id,
    //     // // ! Pendiente: Validar permisos del usuario
    //     // createdBy: createdBy.id,
    //   },
    // });
    if (companyInDb == null)
      throw {
        message: "Tourism company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    
    delete update.id;
    if (update.lat != null) {
      update.geolocation = literal(
        `ST_GeomFromText('POINT(${update.lon} ${update.lat})')`
      );
      lat = update.lat;
      lon = update.lon;
      delete update.lat;
      delete update.lon;
    }

    if (!isNaN(update.phone)) {
      update.phone = `+57${update.phone}`;
    }

    const resultUpdate = await companyInDb.update(update);


    const data = {
      ...resultUpdate.dataValues,
      deletedAt: undefined,
      geolocation: undefined,
      createdBy: undefined,
      lat,
      lon,
    };
    return res.status(StatusCodes.OK).json({
      meta: null,
      data,
    });
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
 * Get the data of tourism company - profile 
 * @param {integer} req.params.id - id of the company
 * @return {object} Response contains: statusCode (integer), json (object): tourism company data. Or if there's error, json (object): status, code, detail
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
    const companyInDb = await db.TourismCompany.findOne({
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
        message: "Tourism company could not be retrieved",
        status: StatusCodes.NOT_FOUND,
      };

    delete companyInDb.dataValues.createdBy;
    delete companyInDb.dataValues.deletedAt;
    companyInDb.dataValues.lat = companyInDb.dataValues.geolocation.coordinates[1];
    companyInDb.dataValues.lon = companyInDb.dataValues.geolocation.coordinates[0];
    delete companyInDb.dataValues.geolocation;

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
 * Destroy a tourism company (soft delete)
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
    const companyInDb = await db.TourismCompany.findByPk( id, {
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
        message: `Tourism company does not found`,
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
 * Get all tourism companies 
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statusCode (integer), json (objeto): data tourism companies. Or if there's error, json (objeto): status, code, detail
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

    const companiesInDb = await db.TourismCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      include: [
        {
          model: db.TourismCategory,
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        exclude: ["createdBy", "deletedAt"],
        include: [
          [col('"TourismCategory"."name"'), "categoryName"],
          [col('"TourismCategory"."color"'), "categoryColor"],
        ],
      },
    });

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no tourism companies registered";
    if (companiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = companiesInDb.rows.map((row) => {
      return {
        ...row.dataValues,
        deletedAt: undefined,
        geolocation: undefined,
        createdBy: undefined,
        lat: row.dataValues.geolocation.coordinates[1],
        lon: row.dataValues.geolocation.coordinates[0],
      };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: Math.ceil(companiesInDb.count / objPage.size),
      },
      data,
    });
  } catch (error) {
    // console.error("Tourism companies could not be recovered: ", error.message);
    return next(error);
  }
};
