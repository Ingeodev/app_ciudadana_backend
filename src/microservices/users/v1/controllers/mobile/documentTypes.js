const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/mobile/documentTypes.js");



/**
 * Get all document types
 * @param {object} req.query - Object containing the number, size
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
      attributes: ["id", "name", "code"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      // Ordered from A-Z
      order: [["code", "ASC"]],
    });

    let message = undefined;
    if (docTypesInDb.count <= 0)
      message = "There are no document types registered";
    if (docTypesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: docTypesInDb.count,
        totalPages: Math.ceil(docTypesInDb.count / objPage.size),
      },
      data: docTypesInDb.rows,
    });
  } catch (error) {
    // console.error("Document types could not be recovered: ", error.message);
    return next(error);
  }
};
