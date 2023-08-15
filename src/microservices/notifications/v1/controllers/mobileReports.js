const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
// const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorReports.js");

/**
 * Create report
 * @param {object} req - Object containing the title, description, securityCategoryId, userId, imageUri, lat, lon
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      securityCategoryId, 
      userId, 
      imageUri, 
      lat, 
      lon 
    } = await validator.vMobilePostRegister(req.body);

    const dataQuery = {
      title, 
      description, 
      securityCategoryId, 
      userId, 
      imageUri, 
      lat, 
      lon
    };
    
    const result = await db.Report.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    console.error(
      "report could not be created: ",
      error.message
    );
    return next(error);
  }
};
