const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/adminsValidator.js");
const { dateHourWithOffset } = require("../../../../utils/utcZone.js");


/**
 * Verify a user's email address
 * @param {object} req - Object containing token, clientId
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEmailVerification = async (req, res, next) => {
  try {
    let { token, ref } = await validator.vWebPostEmailVerification(req.body);

    ref = ref.replace("-", "+").replace("_", "/");
    const padding = ref.length % 4;
    if (padding) {
      ref += "=".repeat(4 - padding);
    }

    const adminInDb = await db.User.findOne({
      where: {
        clientId: Buffer.from(ref, "base64").toString("utf8"),
        tokenEmailVerified: token,
        emailVerified: null,
      },
    });

    if (adminInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The user does not exist`,
      };
    }

    const emailVerified = dateHourWithOffset();

    await adminInDb.update({
      emailVerified
    });

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { emailVerified },
    });
  } catch (error) {
    // console.error("admin could not be updated: ", error.message);
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
