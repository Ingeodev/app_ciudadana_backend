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
      attributes: ["name", "phone", "address", [Sequelize.col("imageUri"), 'image']],
      order: [["name", "ASC"]],
    });

    const categInDb = await db.SecurityCategory.findAll({
      attributes: ["id", "name", [Sequelize.col("iconMap"), "image"], "color"],
      order: [["name", "ASC"]],
    });

    const reportCategories = categInDb.map(item => {
      const mappedItem = {
        ...item.dataValues,
        color: formatColorOutputForMobile(item.color),
      };
      return mappedItem;
    });

    const transformedLines = attentionLInDb.map((line) => {
      const lineData = line.get({ plain: true }); // Convert Sequelize instance to simple object
      if (lineData.phone != null) {
        lineData.phone = String(lineData.phone).replace("+57", "");
      }
      return lineData;
    });

    const responseCustom = {
      reportCategories,
      securityLines: transformedLines,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    return next(error);
  }
};
