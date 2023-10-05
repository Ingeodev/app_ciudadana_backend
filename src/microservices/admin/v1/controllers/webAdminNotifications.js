const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/adminNotificationsValidator.js");

// const Op = db.Sequelize.Op;

/**
 * Get all admin notificacions
 * @param {object} req.query - Object containing the number, size
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

    let message = undefined;
    if (notifInDb.count <= 0)
      message = "There are no Admin Notifications registered.";
    if (notifInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: notifInDb.count,
        totalPages: Math.ceil(notifInDb.count / objPage.size),
      },
      data: notifInDb.rows,
    });
  } catch (error) {
    // console.error("AdminNotifications could not be recovered: ", error.message);
    return next(error);
  }
};
