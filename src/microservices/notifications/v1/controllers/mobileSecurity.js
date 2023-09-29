const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../models/index.js");
// const validator = require("../../utils/validatorSecurity.js");
const { formatColorOutputForMobile } = require("../../../../utils/mobileColorFormatter.js");

/**
 * Get all  attention lines of security/emergency
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const attentionLInDb = await db.Security.findAll({
      where: { active: true },
      attributes: ["name", "phone", "address", [Sequelize.col("imageUri"), 'image'], "siteUri"],
      order: [["name", "ASC"]],
    });

    const categInDb = await db.SecurityCategory.findAll({
      attributes: ["id", "name", [Sequelize.col("imageUri"), "image"], "color"],
      order: [["name", "ASC"]],
    });

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
