const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/tourismServices.js");

/**
 * Get all servives of one tourism company 
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getServices = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetServicesCompany({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
      companyId: res.locals.apiTourismCompanyId,
    });

    const companiesInDb = await db.TourismService.findAndCountAll({
      where: { companyId: objPage.companyId },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not services companies registered",
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
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Create tourism service
 * @param {Array} req.body - Array of objects containing the fields of service (string)
 * @return {object} Response contains: statuscode (integer), json (objects array): id, service, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postService = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { service } = await validator.vWebPostOneService(req.body);

    // First, validate that the company belongs to the user.
    const company = await db.TourismCompany.findOne({
      where: {
        id: res.locals.apiTourismCompanyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (company == null || company.id == null)
      throw {
        message: "The company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    const result = await db.TourismService.create({ service, companyId: res.locals.apiTourismCompanyId });
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The address could not be geocoded: ", error.message);
    return next(error);
  }
};

/**
 * Creates tourism services
 * @param {Array} req.body - Array of objects containing the fields of service (string)
 * @return {object} Response contains: statuscode (integer), json (objects array): id, service, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postBulkService = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { services } = await validator.vWebPostBulkServices(req.body);
    const updatedServices = services.map((service) => ({
      ...service,
      companyId: res.locals.apiTourismCompanyId,
    }));

    // First, validate that the company belongs to the user.
    const company = await db.TourismCompany.findOne({
      where: {
        id: res.locals.apiTourismCompanyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (company == null || company.id == null)
      throw {
        message: "The company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    const result = await db.TourismService.bulkCreate(updatedServices);

    // result.forEach((obj, index) => {
    //   result[index] = {
    //     id: obj.dataValues.id,
    //     service: obj.dataValues.service,
    //     companyId: obj.dataValues.companyId,
    //     createdAt: obj.dataValues.createdAt,
    //     updatedAt: obj.dataValues.updatedAt,
    //     // deletedAt: obj.dataValues.deletedAt,
    //   };
    // });

    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The address could not be geocoded: ", error.message);
    return next(error);
  }
};

/**
 * Update a tourism service
 * @param {object} req - Object containing the id, service
 * @return {object} Response contains: statuscode (integer), json (service object updated) if 200OK. Or if there's error, json (object): status, code, detail
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
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, service, companyId } = await validator.vWebPostEdit({
      id: req.body.id,
      service: req.body.service,
      companyId: res.locals.apiTourismCompanyId,
    });

    // First, validate that the company belongs to the user.
    const companyInDb = await db.TourismCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the service belongs to the user
    const serviceInDb = await db.TourismService.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (serviceInDb == null)
      throw {
        message: "Service not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // const serviceInDb = await db.ThirdPartyCategory.findByPk(id);

    const resultUpdate = await serviceInDb.update({ service });
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
 * Destroy a tourism service (soft delete)
 * @param {object} req - Object containing the id
 * @return {object} Response contains: statuscode (integer), json (object): id, companyId. Or if there's error, json (object): status, code, detail
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
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, companyId } = await validator.vWebPostDelete({
      id: req.body.id,
      companyId: res.locals.apiTourismCompanyId,
    });

    // First, validate that the company belongs to the user.
    const companyInDb = await db.TourismCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the service belongs to the company
    const serviceInDb = await db.TourismService.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (serviceInDb == null)
      throw {
        message: "Service not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    await serviceInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id, companyId },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Destroy many tourism service (soft delete)
 * @param {object} req - Object containing the id
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postBulkServiceDelete = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { ids, companyId } = await validator.vWebPostBulkDelete({
      ids: req.body.ids,
      companyId: res.locals.apiTourismCompanyId,
    });

    // First, validate that the company belongs to the user.
    const companyInDb = await db.TourismCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the service belongs to the company
    const serviceInDb = await db.TourismService.destroy({
      where: {
        id: {
          [Sequelize.Op.in]: ids,
        },
        companyId: companyInDb.id,
      },
    });

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { ids, companyId },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};
