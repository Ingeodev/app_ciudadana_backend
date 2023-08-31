const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Get current attention line
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionLine = async (req, res, next) => {
  try {
    const attentionLineDb = await db.AttentionLine.findOne({
      attributes: ["phone", "whatsapp"],
      // Ordered from current date
      order: [["createdAt", "DESC"]],
    });

    if (attentionLineDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention line information could not be retrieved",
      };
    }
    return res.status(StatusCodes.OK).send(attentionLineDb);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};