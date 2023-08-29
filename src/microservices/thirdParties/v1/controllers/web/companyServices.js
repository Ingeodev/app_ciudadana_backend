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

    services.forEach((service) => {
      service.thirdPartyCompanyId = service.companyId;
      delete service.companyId;
    });

    const result = await db.ThirdPartyService.bulkCreate(services);

    result.forEach((obj, index) => {
      result[index] = {
        id: obj.dataValues.id,
        service: obj.dataValues.service,
        companyId: obj.dataValues.thirdPartyCompanyId,
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
