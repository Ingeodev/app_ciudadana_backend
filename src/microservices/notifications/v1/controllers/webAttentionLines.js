const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Create attention line
 * @param {object} req - Object containing the name, phone, imageUri, siteUri, address
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { phone, whatsapp } = await validator.vWebPostRegister(req.body);

    const dataQuery = {
      phone: `+57${phone}`,
      whatsapp: `+57${whatsapp}`
    };
    
    const result = await db.AttentionLine.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    console.error(
      "attention line could not be created: ",
      error.message
    );
    return next(error);
  }
};
