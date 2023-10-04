const { StatusCodes } = require("http-status-codes");
const validator = require("../../../utils/validators/web/base.js");

/**
 * Validate lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia
 * @param {object} req - Object containing the lat, lon
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postValidateLatLon = async (req, res, next) => {
  try {
    const { lat, lon } = await validator.vWebPostLatLon(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json({ meta: null, data: { lat, lon } });
  } catch (error) {
    // console.error("ThirdParty category could not be created: ", error.message);
    return next(error);
  }
};
