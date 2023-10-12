const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/mobile/categories.js");
const { formatColorOutputForMobile } = require("../../../../../utils/mobileColorFormatter.js");



/**
 * Get all ThirdPartyCategories
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statuscode (integer), json (objeto): data ThirdPartyCategories. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const categoriesInDb = await db.ThirdPartyCategory.findAndCountAll({
      attributes: ["id", "name", "color", "icon", "iconMap"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["name", "ASC"]],
    });

    // if (categoriesInDb.count <= 0) {
    //   throw {
    //     status: StatusCodes.NOT_FOUND,
    //     message: "There are no third-party categories registered",
    //   };
    // }
    // if (categoriesInDb.rows.length <= 0) {
    //   throw {
    //     status: StatusCodes.BAD_REQUEST,
    //     message: '"page.number" is too large for the number of possible pages',
    //   };
    // }
    
    const mappedRows = categoriesInDb.rows.map(row => {
      const mappedRow = {
        ...row.dataValues,
        color: formatColorOutputForMobile(row.dataValues.color),
      };
      return mappedRow;
    });
    
    return res.status(StatusCodes.OK).json(mappedRows);
  } catch (error) {
    // console.error("Document types could not be recovered: ", error.message);
    return next(error);
  }
};
