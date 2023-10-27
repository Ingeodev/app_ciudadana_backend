const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/tourismServices.js");

/**
 * Checks whether an TourismCompany ID exists and refers to an existing category.
 * @param {number} companyId The ID of an TourismCompany, or ``null``.
 * @returns {boolean} `true` if the `categoryId` is `null` or exists in the TourismCompany table. ``false`` otherwise.
 */
const checkCompanyExists = async (companyId) => {
  if (companyId != null) {
    const companyInDb = await db.TourismCompany.findByPk(companyId, { attributes: ['id'], paranoid: true });
    if (companyInDb == null)
      return false;
  }
  return true;
};

/**
 * Get all services of one tourism company 
 * @param {object} req.query - Object containing the number and size
 * @param {integer} req.params.id - id of the company
 * @return {object} Response contains: statusCode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getServices = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
      companyId: req.params.id ? parseInt(req.params.id) : null,
    });

    if (!(await checkCompanyExists(objPage.companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The tourism company not found.",
      };

    const companiesInDb = await db.TourismService.findAndCountAll({
      where: { companyId: objPage.companyId },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no registered company services";
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
 * Creates and updates company services
 * @param {Array} req.body - Array of objects containing the fields of service (string) and companyId (integer)
 * @return {object} Response contains: statusCode (integer), json (objects array): id, service, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postServices = async (req, res, next) => {
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

    const { services, companyId } = await validator.vWebPostServices(req.body);

    if (!(await checkCompanyExists(companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The tourism company not found.",
      };
    
    services.forEach((obj, index) => {
      services[index] = {
        service: obj.service,
        companyId,
      };
    });

    const result = await db.TourismService.bulkCreate(services);

    result.forEach((obj, index) => {
      result[index] = {
        id: obj.dataValues.id,
        service: obj.dataValues.service,
        companyId: obj.dataValues.companyId,
      };
    });

    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The services could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "There is a service(s) that has been previously created.";
      error.status = StatusCodes.BAD_REQUEST;
    } 
    return next(error);
  }
};

/**
 * Update a service company
 * @param {object} req - Object containing the id, service, companyId
 * @return {object} Response contains: statusCode (integer), json (service object updated) if 200OK. Or if there's error, json (object): status, code, detail
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

    const { id, service, companyId } = await validator.vWebPostEdit(req.body);

    if (!(await checkCompanyExists(companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The company not found.",
      };

    // Validate that the service belongs to the user
    const serviceInDb = await db.TourismService.findOne({
      where: {
        id,
        companyId,
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
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "service must be unique";
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Destroy a service company (soft delete)
 * @param {object} req - Object containing the id, companyId
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
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, companyId } = await validator.vWebPostDelete(req.body);

    if (!(await checkCompanyExists(companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The company not found.",
      };

    // Validate that the service belongs to the company
    const serviceInDb = await db.TourismService.findOne({
      where: {
        id,
        companyId,
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
