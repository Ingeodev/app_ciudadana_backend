const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Create attention line
 * @param {object} req - Object containing the name, phone, imageUri, siteUri, address
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { phone, whatsapp } = await validator.vWebPostRegister(req.body);
    
    const result = await db.AttentionLine.create({
      phone: `+57${phone}`,
      whatsapp: `+57${whatsapp}`,
    });
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    console.error(
      "attention line could not be created: ",
      error.message
    );
    return next(error);
  }
};

/**
 * Get the attention line
 * @return {object} Response contains: statusCode (integer), json (object): Attention line data. Or if there's error, json (object): status, code, detail
 */
exports.getOne = async (req, res, next) => {
  try {
    const lineInDb = await db.AttentionLine.findOne({
      attributes: {
        exclude: ["id", "createdBy", "deletedAt"],
      },
      order: [["createdAt", "DESC"]],
    });

    if (lineInDb == null)
      throw {
        message: "Attention line could not be retrieved",
        status: StatusCodes.NOT_FOUND,
      };

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: lineInDb,
    });
  } catch (error) {
    // console.error("Attention line could not be recovered: ", error.message);
    return next(error);
  }
};
