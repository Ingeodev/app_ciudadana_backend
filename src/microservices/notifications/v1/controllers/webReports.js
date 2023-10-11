const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models");
const validator = require("../../utils/validatorReports.js");
const { Sequelize } = require("sequelize");

/**
 * Get all reports by user
 * @return {object} Response contains: statusCode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllByUser = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileGetListAllClosest({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });
    const offset = (objPage.number - 1) * objPage.size;

    const userData = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ['id'],
    });

    if (userData == null || userData.id == null)
      throw {
        message: 'Requesting user is not allowed to get reports or is not registered in the database yet.',
        status: StatusCodes.FORBIDDEN,
      };

    const usersCount = await db.User.count({
      where: { disabled: false, userMobile: false },
    });

    if (usersCount <= 0)
      throw {
        message: 'No web users registered in the database.',
        status: StatusCodes.NOT_FOUND,
      };

    const reportsDb = await db.Report.findAndCountAll({
      where: { userId: userData.id },
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
    let message = undefined;
    if (reportsDb.count <= 0)
      message = 'There are no Reports registered in the database.';
    if (reportsDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = reportsDb.rows.map(row => {
      return { ...row.dataValues, SecurityCategory: undefined };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
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

/**
 * Get all reports
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAllClosest({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });
    const offset = (objPage.number - 1) * objPage.size;

    const reportsDb = await db.Report.findAndCountAll({
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
    let message = undefined;
    if (reportsDb.count <= 0)
      message = 'There are no Reports registered in the database.';
    if (reportsDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = reportsDb.rows.map(row => {
      return { ...row.dataValues, SecurityCategory: undefined };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
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