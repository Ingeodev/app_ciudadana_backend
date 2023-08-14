const { StatusCodes } = require("http-status-codes");

const { appFirebase } = require("../../../../middleware/authMiddleware")
const validator = require("../../utils/validator");
const db = require("../../../../models/index");

const firebaseCMTopicName = process.env.FCM_TOPIC_NAME_MOBILE;

const registerPush = async (req, res, next) => {
  try {
    const { deviceToken } = await validator.validateRegisterPushSchema(req.body);
    const userData = await db.User.findOne({
      where: { disabled: false, userMobile: true, clientId: res.locals.uid }
    });
    if (userData == null || userData.id == null)
      throw {
        message: 'Requesting mobile user is not registered in the database yet.',
        status: StatusCodes.FORBIDDEN,
      };
    const firebaseResponse = await appFirebase.messaging().subscribeToTopic(deviceToken, firebaseCMTopicName);
    if (firebaseResponse.errors != null && firebaseResponse.errors.length > 0) {
      const messages = [];
      const codes = [];
      firebaseResponse.errors.forEach(er => {
        messages.push(er.error.message);
        codes.push(er.error.code);
      });
      const message = messages.join('  - ');
      let status = StatusCodes.INTERNAL_SERVER_ERROR;
      if (codes.includes('messaging/invalid-registration-token'))
        status = StatusCodes.UNPROCESSABLE_ENTITY;
      throw { status, message };
    }
    await userData.update({ pushDeviceToken: deviceToken });
    console.log({ firebaseResponse });
    return res
      .status(StatusCodes.OK)
      .json({ deviceToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all alerts
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
// TODO: Review AND Implement
const getListActive = async (req, res, next) => {
  try {
    const { page: objPage } = await validator.validateSimplePaginationSchema(req.query);

    const alertsInDb = await db.Alert.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (alertsInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Alerts registered in the database",
      };
    }
    if (alertsInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(alertsInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: alertsInDb.count,
        totalPages: totalPages,
        //TODO: Review AND Implement
        message: 'TODO: Review AND Implement',
      },
      data: alertsInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("alerts could not be recovered: ", error.message);
    return next(error);
  }
};

module.exports = {
  registerPush,
  getListActive,
};
