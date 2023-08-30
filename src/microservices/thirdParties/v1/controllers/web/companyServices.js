const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/companyServices.js");


/**
 * Creates and updates company services
 * @param {Array} req.body - Array of objects containing the fields of service (string) and companyId (integer)
 * @return {object} Response contains: statuscode (integer), json (objects array): id, service, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postServices = async (req, res, next) => {
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

    const { services } = await validator.vWebPostServices(req.body);

    // First, validate that the company belongs to the user.
    const company = await db.ThirdPartyCompany.findOne({
      where: {
        id: services[0].companyId,
        createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (company == null || company.id == null)
      throw {
        message: "The company does not belong to you",
        status: StatusCodes.FORBIDDEN,
      };

    const result = await db.ThirdPartyService.bulkCreate(services);

    result.forEach((obj, index) => {
      result[index] = {
        id: obj.dataValues.id,
        service: obj.dataValues.service,
        companyId: obj.dataValues.companyId,
        // createdAt: obj.dataValues.createdAt,
        // updatedAt: obj.dataValues.updatedAt,
        // deletedAt: obj.dataValues.deletedAt,
      };
    });

    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The address could not be geocoded: ", error.message);
    return next(error);
  }
};

/**
 * Update a service company
 * @param {object} req - Object containing the id, service, companyId
 * @return {object} Response contains: statuscode (integer), json (service object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
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

    const { id, service, companyId } = await validator.vWebPostEdit(req.body);

    // First, validate that the company belongs to the user.
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id: companyId,
        createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The company does not belong to you",
        status: StatusCodes.FORBIDDEN,
      };

    // Validate that the service belongs to the user
    const serviceInDb = await db.ThirdPartyService.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (serviceInDb == null)
      throw {
        message: "Service editing failure",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
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
 * Destroy a service company (soft delete)
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
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

    const { id, companyId } = await validator.vWebPostDelete(req.body);

    // First, validate that the company belongs to the user.
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id: companyId,
        createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The company does not belong to you",
        status: StatusCodes.FORBIDDEN,
      };

    // Validate that the service belongs to the company
    const serviceInDb = await db.ThirdPartyService.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (serviceInDb == null)
      throw {
        message: "Service deleting failure",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
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
