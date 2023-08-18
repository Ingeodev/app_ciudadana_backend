const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorReports.js");
const { Sequelize } = require("sequelize");

/**
 * Get all reports by user
 * @return {object} Response contains: statuscode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllByUser = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAllByUser({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });
    const offset = (objPage.number - 1) * objPage.size;

    const { id } = await validator.vWebGetOne({
      id: parseInt(req.params.id),
    });

    const reportsDb = await db.Report.findAndCountAll({
      where: { userId: id },
      unique: true,
      paranoid: true,
      order: [["createdAt", "DESC"]],
      offset,
      limit: objPage.size,
      include: [{
        model: db.SecurityCategory,
        attributes: ['name'],
        required: false,
      }],
      attributes: {
        exclude: ["deletedAt", "SecurityCategory"],
        include: [
          [Sequelize.col('"SecurityCategory"."name"'), 'securityCategoryName']
        ],
      },
    });

    if (reportsDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'There are no Reports registered in the database.',
      };
    if (reportsDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages.',
      };

    const data = reportsDb.rows.map(row => {
      return { ...row.dataValues, SecurityCategory: undefined };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: reportsDb.count,
        totalPages: Math.ceil(reportsDb.count / objPage.size),
      },
      data,
    });
  } catch (error) {
    return next(error);
  }
};
