const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models");
const validator = require("../../utils/validatorReports.js");
const { col, Op } = require("sequelize");

/**
 * Get all reports by user
 * @return {object} Response contains: statusCode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllByUser = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAllClosest({
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
          [col('"SecurityCategory"."name"'), 'securityCategoryName']
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
          [col('"SecurityCategory"."name"'), 'securityCategoryName']
        ],
      },
    });
    let message = undefined;
    if (reportsDb.count <= 0)
      message = 'There are no Reports registered in the database.';
    if (reportsDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';
    
    const currentDate = new Date();    
    const data = reportsDb.rows.map(row => {
      // Verify if it is within three days (period to approve the report).
      const created = new Date(row.dataValues.createdAt);
      const difference = currentDate - created;

      const differenceInHours = difference / (1000 * 60 * 60);
      let editable = null;
      if (differenceInHours <= 72) {
        switch (row.dataValues.isApproved) {
          case "yes":
            editable = "disapprove";
            break;
          case "no":
            editable = "approve";
            break;
          case null:
            editable = "both";
            break;
          default:
            throw {
              message: "Inconsistent data in the db",
              status: StatusCodes.INTERNAL_SERVER_ERROR,
            };
            break;
        }
      } else {
        switch (row.dataValues.isApproved) {
          case "yes":
            editable = "none";
            break;
          case "no":
            editable = "none";
            break;
          case null:
            editable = "disapprove";
            break;
          default:
            throw {
              message: "Inconsistent data in the db",
              status: StatusCodes.INTERNAL_SERVER_ERROR,
            };
            break;
        }
      }

      return { ...row.dataValues, SecurityCategory: undefined, editable };
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
 * Approve a report
 * @param {integer} req.body.id - id of the report
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply. Or if there's error, json (objeto): status, code, detail
 */
exports.postApprove = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = await validator.vWebPostApprove({ id: req.body.id });

    const reportInDb = await db.Report.findByPk(id, {
      include: [
        {
          model: db.ReportStatus,
          // as: "ReportStatus",
          attributes: ["status"],
          required: false,
          order: [["createdAt", "DESC"]],
          limit: 1,
          where: {
            status: {
              [Op.ne]: "APPROVED",
            },
          },
        },
      ],
    });

    if (reportInDb === null || reportInDb.ReportStatuses.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The report does not exist or has been approved`,
      };
    }

    // Verify if it is within three days (period to approve the report).
    const createdAt = new Date(reportInDb.createdAt);
    const currentDate = new Date();
    const difference = currentDate - createdAt;

    const differenceInHours = difference / (1000 * 60 * 60);
    let resultUpdate = null;
    if (differenceInHours <= 72) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      resultUpdate = await reportInDb.update(
        { isApproved: "yes", expiresAt },
        { transaction }
      );

      await db.ReportStatus.create(
        {
          reportId: reportInDb.dataValues.id,
          status: "APPROVED",
        },
        { transaction }
      );
    } else {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: `The report cannot be approved because more than 3 days have passed since its creation.`,
      };
    }

    await transaction.commit();
    delete resultUpdate.dataValues.ReportStatuses;
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};

/**
 * Disapprove a report
 * @param {integer} req.body.id - id of the report
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply. Or if there's error, json (objeto): status, code, detail
 */
exports.postDisapprove = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = await validator.vWebPostApprove({ id: req.body.id });

    const reportInDb = await db.Report.findByPk(id, {
      include: [
        {
          model: db.ReportStatus,
          // as: "ReportStatus",
          attributes: ["status"],
          required: false,
          order: [["createdAt", "DESC"]],
          limit: 1,
          where: {
            status: {
              [Op.ne]: "DISAPPROVED",
            },
          },
        },
      ],
    });

    if (reportInDb === null || reportInDb.ReportStatuses.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The report does not exist or has been disapproved`,
      };
    }

    // Verify if it is within three days
    const createdAt = new Date(reportInDb.createdAt);
    const currentDate = new Date();
    const difference = currentDate - createdAt;

    const differenceInHours = difference / (1000 * 60 * 60);
    if (differenceInHours > 72 && reportInDb.isApproved === "APPROVED") {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: `The report cannot be disapproved because more than 3 days have passed since its creation.`,
      };
    }

    const resultUpdate = await reportInDb.update(
      { isApproved: "no", expiresAt: null },
      { transaction }
    );

    await db.ReportStatus.create(
      {
        reportId: reportInDb.dataValues.id,
        status: "DISAPPROVED",
      },
      { transaction }
    );

    await transaction.commit();
    delete resultUpdate.dataValues.ReportStatuses;
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};

/**
 * Modify the expiration date of an approved report
 * @param {object} req.body - id of the report, n expires (max 23:59) in format hh:mm
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply. Or if there's error, json (objeto): status, code, detail
 */
exports.postExpires = async (req, res, next) => {
  try {
    const { id, expires  } = await validator.vWebPostExpires(req.body);

    const reportInDb = await db.Report.findOne({
      where: {
        id,
        isApproved: "yes"
      },
      include: [
        {
          model: db.ReportStatus,
          // as: "ReportStatus",
          attributes: ["status"],
          required: false,
          order: [["createdAt", "DESC"]],
          limit: 1,
          where: {
            status: "APPROVED",
          },
        },
      ],
    });

    if (reportInDb === null || reportInDb.ReportStatuses.length === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The report does not exist or has not been approved`,
      };
    }

    const [hours, minutes] = expires.split(":").map(Number);
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + hours);
    currentDate.setMinutes(currentDate.getMinutes() + minutes);

    const resultUpdate = await reportInDb.update({ expiresAt: currentDate });
    delete resultUpdate.dataValues.ReportStatuses;
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get report by id
 * @param {integer} req.params.id - id of report
 * @return {object} Response contains: statusCode (integer), json (objeto): report data. Or if there's error, json (objeto): status, code, detail
 */
exports.getReport = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOne({
      id: req.params.id ? parseInt(req.params.id) : null,
    });

    const reportInDb = await db.Report.findByPk(id, {
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (reportInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Report information could not be retrieved",
      };
    }

    const currentDate = new Date();
    
    // Verify if it is within three days (period to approve the report).
    const created = new Date(reportInDb.dataValues.createdAt);
    const difference = currentDate - created;

    const differenceInHours = difference / (1000 * 60 * 60);
    let editable = null;
    if (differenceInHours <= 72) {
      switch (reportInDb.dataValues.isApproved) {
        case "yes":
          editable = "disapprove";
          break;
        case "no":
          editable = "approve";
          break;
        case null:
          editable = "both";
          break;
        default:
          throw {
            message: "Inconsistent data in the db",
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          };
          break;
      }
    } else {
      switch (reportInDb.dataValues.isApproved) {
        case "yes":
          editable = "none";
          break;
        case "no":
          editable = "none";
          break;
        case null:
          editable = "disapprove";
          break;
        default:
          throw {
            message: "Inconsistent data in the db",
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          };
          break;
      }
    }

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: { ...reportInDb.dataValues, editable } });
  } catch (error) {
    // console.error("Report could not be recovered: ", error.message);
    return next(error);
  }
};
