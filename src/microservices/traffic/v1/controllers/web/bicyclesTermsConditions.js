const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/bicyclesTermsConditions.js");

/**
 * Create a the terms and conditions
 * @param {string} req.body.termsConditions - terms and conditions (text)
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

    const { termsConditions } = await validator.vWebPostRegister(req.body);

    let result = await db.BicyclesTermCondition.create({
      createdBy: createdBy.id,
      termsConditions,
    });

    result = result.toJSON();

    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        termsConditions: result.termsConditions,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    // console.error("Road state could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Get the data of the terms and conditions
 * @return {object} Response contains: statusCode (integer), json (object): the terms and conditions. Or if there's error, json (object): status, code, detail
 */
exports.getTermsConditions = async (req, res, next) => {
  try {
    let termInDb = await db.BicyclesTermCondition.findOne({
      attributes: ["createdAt", "termsConditions"],
      order: [["createdAt", "DESC"]],
    });

    if (termInDb === null){
      termInDb = {};
      termInDb.termsConditions = "";
      termInDb.createdAt = null;
      // throw {
      //   message: "No terms and conditions",
      //   status: StatusCodes.NOT_FOUND,
      // };
    }

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: termInDb,
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};
