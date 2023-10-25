const { StatusCodes } = require("http-status-codes");
const { literal, col } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/companies.js");

/**
 * Checks whether an ThirdPartyCategory ID exists and refers to an existing category.
 * @param {number} categoryId The ID of an ThirdPartyCategory, or ``null``.
 * @returns {boolean} `true` if the `categoryId` is `null` or exists in the ThirdPartyCategory table. ``false`` otherwise.
 */
const checkCategoryExists = async (categoryId) => {
  if (categoryId != null) {
    const categoryExists = await db.ThirdPartyCategory.findByPk(categoryId, { attributes: ['id'], paranoid: true });
    if (categoryExists == null)
      return false;
  }
  return true;
};

/**
 * Create a company
 * @param {object} req - Object containing the name, nit, categoryId, description, phone, siteUri, address, imageUri, lat, lon
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

    const { name, nit, categoryId, description, phone, siteUri, address, imageUri, lat, lon } =
      await validator.vWebPostRegister(req.body);

    if (!await checkCategoryExists(categoryId))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'The assigned category does not exist.',
      };

    const result = await db.ThirdPartyCompany.create({
      createdBy: createdBy.id,
      name,
      nit,
      categoryId,
      description,
      phone: `+57${phone}`,
      siteUri,
      address,
      imageUri,
      lat,
      lon,
      geolocation: literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    });
    delete result.dataValues.createdBy;
    // ! Front necesita la variable de geolocation?? 
    delete result.dataValues.geolocation;
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "Name and Nit must be unique";
      error.status = StatusCodes.BAD_REQUEST;
    } 
    return next(error);
  }
};

/**
 * Update a company
 * @param {object} req - Object containing the id, name, nit, categoryId, description, phone, siteUri, address, imageUri, lat, lon
 * @return {object} Response contains: statusCode (integer), json (category object updated) if 200OK. Or if there's error, json (object): status, code, detail
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
      nit,
      categoryId,
      description,
      phone,
      siteUri,
      address,
      imageUri,
      lat,
      lon,
    } = await validator.vWebPostEdit(req.body);

    if (!isNaN(categoryId))
      if (!(await checkCategoryExists(categoryId)))
        throw {
          status: StatusCodes.NOT_FOUND,
          message: "The assigned category does not exist.",
        };

    // Validate that the company belongs to the user
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
    });

    if (companyInDb == null)
      throw {
        message: "Company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);

    const resultUpdate = await companyInDb.update({
      id,
      name,
      nit,
      categoryId,
      description,
      phone: `+57${phone}`,
      siteUri,
      address,
      imageUri,
      lat,
      lon,
      geolocation: literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    });
    delete resultUpdate.dataValues.createdBy;
    delete resultUpdate.dataValues.geolocation;
    delete resultUpdate.dataValues.deletedAt;

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "Name and Nit must be unique";
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get the data of company and your services - to profile 
 * @param {integer} req.params.id - companyId
 * @return {object} Response contains: statusCode (integer), json (object): company data. Or if there's error, json (object): status, code, detail
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
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
      include: [
        {
          model: db.ThirdPartyCategory,
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        exclude: ["createdBy", "geolocation", "deletedAt"],
        include: [
          [col('"ThirdPartyCategory"."name"'), "categoryName"],
        ],
      },
    });

    if (companyInDb == null)
      throw {
        message: "Company could not be retrieved",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // Get company services
    const servicesInDb = await db.ThirdPartyService.findAndCountAll({
      where: { companyId: companyInDb.id },
      attributes: ["id", "service", "companyId", "createdAt", "updatedAt"],
    });

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);
    delete companyInDb.dataValues.createdBy;
    // ! Front necesita la variable de geolocation??
    delete companyInDb.dataValues.geolocation;
    delete companyInDb.dataValues.deletedAt;

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: {
        company: companyInDb,
        services: servicesInDb.rows,
      },
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all companies 
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statusCode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
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

    const companiesInDb = await db.ThirdPartyCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      include: [
        {
          model: db.ThirdPartyCategory,
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        exclude: ["createdBy", "geolocation", "deletedAt"],
        include: [
          [col('"ThirdPartyCategory"."name"'), "categoryName"],
          [col('"ThirdPartyCategory"."color"'), "categoryColor"],
        ],
      },
    });

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no companies registered";
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
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a company (soft delete)
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
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
    });

    if (companyInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Company does not found`,
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
