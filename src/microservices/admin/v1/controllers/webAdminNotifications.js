const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/adminNotificationsValidator.js");

// const Op = db.Sequelize.Op;

/**
 * Get all admin notificacions
 * @return {object} Response contains: statuscode (integer), json (objeto): data admin notificacions. Or if there's error, json (objeto): status, code, detail
 */
exports.getAllNotifications = async (req, res, next) => {
  try {
    const objPage = await validator.vGetAllNotif({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const notifInDb = await db.AdminNotification.findAndCountAll({
      where: {
        status: "UNREAD",
      },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (notifInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no AdminNotifications registered in the database",
      };
    }
    if (notifInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(notifInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: notifInDb.count,
        totalPages: totalPages,
      },
      data: notifInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("AdminNotifications could not be recovered: ", error.message);
    return next(error);
  }
};
