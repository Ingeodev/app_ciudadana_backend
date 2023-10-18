const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/trafficNotifications.js");

/**
 * Create a configuration of traffic notifications
 * @param {object} req - Object containing the recurrence, dataNumber, colorLevel1, limit1and2, colorLevel2, limit2and3, colorLevel3, limit3and4, colorLevel4,
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
      recurrence,
      dataNumber,
      colorLevel1,
      limit1and2,
      colorLevel2,
      limit2and3,
      colorLevel3,
      limit3and4,
      colorLevel4,
    } = await validator.vWebPostRegister(req.body);
    
    const result = await db.TrafficNotification.create({
      createdBy: createdBy.id,
      recurrence,
      dataNumber,
      colorLevel1,
      limit1and2,
      colorLevel2,
      limit2and3,
      colorLevel3,
      limit3and4,
      colorLevel4,
    });

    const data = {
      ...result.dataValues,
      id: undefined,
      createdBy: undefined,
      deletedAt: undefined,
    };

    return res.status(StatusCodes.CREATED).json({ meta: null, data: data });
  } catch (error) {
    // console.error("Configuration of traffic notification could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Get the configuration of traffic notifications
 * @return {object} Response contains: statusCode (integer), json (object): Configuration of traffic notification data. Or if there's error, json (object): status, code, detail
 */
exports.getOne = async (req, res, next) => {
  try {
    const trafficInDb = await db.TrafficNotification.findOne({
      attributes: {
        exclude: ["id", "createdBy", "deletedAt"],
      },
      order: [["createdAt", "DESC"]],
    });

    if (trafficInDb == null)
      throw {
        message: "Configuration of traffic notification could not be retrieved",
        status: StatusCodes.NOT_FOUND,
      };
    
    return res.status(StatusCodes.OK).send({
      meta: null,
      data: trafficInDb,
    });
  } catch (error) {
    // console.error("Configuration of traffic notification could not be recovered: ", error.message);
    return next(error);
  }
};
