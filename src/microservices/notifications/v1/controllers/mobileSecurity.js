const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorSecurity.js");

/**
 * Get all  attention lines of security/emergency
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    // const objPage = await validator.vMobileMGetListAll({
    //   number: req.query.page ? parseInt(req.query.page.number) : 1,
    //   size: req.query.page ? parseInt(req.query.page.size) : 100,
    // });

    // const attentionLInDb = await db.Security.findAndCountAll({
    //   where: { active: true },
    //   attributes: ["name", "phone", "address"],
    //   limit: objPage.size,
    //   offset: (objPage.number - 1) * objPage.size,
    //   // Ordered from A-Z
    //   order: [["name", "ASC"]],
    // });

    // const attentionLInDb = await db.Security.findAndCountAll({
    const attentionLInDb = await db.Security.findAll({
      where: { active: true },
      attributes: ["name", "phone", "address", "imageUri", "siteUri"],
      // limit: objPage.size,
      // offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    if (!attentionLInDb || attentionLInDb.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Attention Lines registered in the database",
      };
    }

    const categInDb = await db.SecurityCategory.findAll({
      attributes: ["id", "name", "imageUri", "siteUri", "color"],
      // limit: objPage.size,
      // offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    if (!categInDb || categInDb.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Attention Lines registered in the database",
      };
    }

    // if (attentionLInDb.count <= 0)
    //   throw {
    //     status: StatusCodes.NOT_FOUND,
    //     message: "There are no Attention Lines registered in the database",
    //   };
    // if (attentionLInDb.rows.length <= 0)
    //   throw {
    //     status: StatusCodes.BAD_REQUEST,
    //     message: '"page.number" is too large for the number of possible pages',
    //   };
    // const totalPages = Math.ceil(attentionLInDb.count / objPage.size);

    const responseCustom = {
      reportCategories: categInDb,
      securityLines: attentionLInDb,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};
