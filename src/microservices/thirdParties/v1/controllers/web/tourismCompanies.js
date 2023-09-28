const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/tourismCompanies.js");

/**
 * Create a tourism company
 * @param {object} req - Object containing the name, nit, categoryId, description, address, phone, imageUri, siteUri, lat, lon
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

    // Check if the category exists
    const categInDb = await db.TourismCategory.findByPk(categoryId);
    if (categInDb == null || categInDb.id == null)
      throw {
        message: "Category not found.",
        status: StatusCodes.NOT_FOUND,
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
      geolocation: Sequelize.literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
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
 * @return {object} Response contains: statuscode (integer), json (tourism company object updated) if 200OK. Or if there's error, json (object): status, code, detail
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
    let categInDb = undefined;
    let lat = undefined;
    let lon = undefined;

    if (!isNaN(update.categoryId)) {
      categInDb = await db.TourismCategory.findByPk(update.categoryId);
      if (categInDb == null || categInDb.id == null)
        throw {
          message: "Category not found.",
          status: StatusCodes.NOT_FOUND,
        };
    }

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
      update.geolocation = Sequelize.literal(
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
 * @return {object} Response contains: statuscode (integer), json (object): tourism company data. Or if there's error, json (object): status, code, detail
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
 * Destroy a tourism company (soft delete)
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
 * @return {object} Response contains: statuscode (integer), json (objeto): data tourism companies. Or if there's error, json (objeto): status, code, detail
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
          [Sequelize.col('"TourismCategory"."name"'), "categoryName"],
          [Sequelize.col('"TourismCategory"."color"'), "categoryColor"],
        ],
      },
    });

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not tourism companies registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(companiesInDb.count / objPage.size);

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

    return res.status(StatusCodes.OK).send({
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: totalPages,
      },
      data,
    });
  } catch (error) {
    // console.error("Tourism companies could not be recovered: ", error.message);
    return next(error);
  }
};
