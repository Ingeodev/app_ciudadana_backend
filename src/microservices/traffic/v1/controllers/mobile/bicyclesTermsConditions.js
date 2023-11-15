const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const { dateHourWithOffset } = require("../../../../../utils/utcZone.js");
const validator = require("../../../utils/validators/mobile/bicyclesTermsConditions.js");

/**
 * Get the data of the terms and conditions
 * @return {object} Response contains: statusCode (integer), json (object): the terms and conditions. Or if there's error, json (object): status, code, detail
 */
exports.getTerms = async (req, res, next) => {
  try {
    let termInDb = await db.BicyclesTermCondition.findOne({
      attributes: ["createdAt", "termsConditions"],
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(StatusCodes.OK)
      .send({ content: termInDb.termsConditions });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * The mobile user accepts the terms and conditions
 * @param {boolean} req.body.agreeWithTermsAndConditions - boolean
 * @return {object} Response contains: statusCode (integer), json (object): echo reply. Or if there's error, json (object): status, code, detail
 */
exports.postAcceptTerms = async (req, res, next) => {
  try {
    const userInDb = await db.User.findOne({
      where: { disabled: false, userMobile: true, clientId: res.locals.uid },
      attributes: ["id", "acceptBicycleTerms"],
    });

    if (userInDb == null || userInDb.id == null)
      throw {
        message: "User is not registered in the database yet.",
        status: StatusCodes.UNAUTHORIZED,
      };
    
    const { agreeWithTermsAndConditions } = await validator.vMPostAcceptTerms(req.body);
    
    if (userInDb.acceptBicycleTerms !== null) {
      return res.status(StatusCodes.OK).send({ agreeWithTermsAndConditions: true });
    }

    if (agreeWithTermsAndConditions) {
      await userInDb.update({ acceptBicycleTerms: dateHourWithOffset() });
    }

    return res.status(StatusCodes.OK).send({ agreeWithTermsAndConditions });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get if the mobile user has accepted the terms and conditions
 * @return {object} Response contains: statusCode (integer), json (object): agreeWithTermsAndConditions. Or if there's error, json (object): status, code, detail
 */
exports.getAcceptTerms = async (req, res, next) => {
  try {
    const userInDb = await db.User.findOne({
      where: { disabled: false, userMobile: true, clientId: res.locals.uid },
      attributes: ["id", "acceptBicycleTerms"],
    });

    if (userInDb == null || userInDb.id == null)
      throw {
        message: "User is not registered in the database yet.",
        status: StatusCodes.UNAUTHORIZED,
      };
    
    if (userInDb.acceptBicycleTerms === null) {
      return res.status(StatusCodes.OK).send({ agreeWithTermsAndConditions: false });
    }

    return res.status(StatusCodes.OK).send({ agreeWithTermsAndConditions: true });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};
