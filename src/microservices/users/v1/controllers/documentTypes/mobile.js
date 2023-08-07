const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
// const { formatDate } = require("../../../../../middleware/formatDate.js");
const validator = require("../../../utils/validators/documentTypes/mobile.js");



/**
 * Get all document types
 * @return {object} Response contains: statuscode (integer), json (objeto): data document types. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const docTypesInDb = await db.DocumentType.findAndCountAll({
      where: { active: true },
      attributes: ["id", "name", "abbreviation"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["abbreviation", "ASC"]],
    });

    if (docTypesInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Document types could not be recovered",
      };
    }
    return res.status(StatusCodes.OK).send(docTypesInDb.rows);
  } catch (error) {
    console.error("Document types could not be recovered: ", error.message);
    return next(error);
  }
};
