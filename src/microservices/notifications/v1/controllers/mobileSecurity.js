const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorSecurity.js");
const { formatColorOutputForMobile } = require("../../../../utils/mobileColorFormatter.js");

/**
 * Get all  attention lines of security/emergency
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const attentionLInDb = await db.Security.findAll({
      where: { active: true },
      attributes: ["name", "phone", "address", "imageUri", "siteUri"],
      order: [["name", "ASC"]],
    });

    if (!attentionLInDb || attentionLInDb.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Attention Lines registered in the database",
      };
    }

    const categInDb = await db.SecurityCategory.findAll({
      attributes: ["id", "name", "imageUri", "color"],
      order: [["name", "ASC"]],
    });

    if (!categInDb || categInDb.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Attention Lines registered in the database",
      };
    }

    const reportCategories = categInDb.map(item => {
      const mappedItem = {
        ...item.dataValues,
        color: formatColorOutputForMobile(item.color),
      };
      return mappedItem;
    });

    const responseCustom = {
      reportCategories,
      securityLines: attentionLInDb,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    return next(error);
  }
};
