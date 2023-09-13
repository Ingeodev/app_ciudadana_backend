const { StatusCodes } = require("http-status-codes");
const { Op } = require('sequelize');

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
const getListActive = async (req, res, next) => {
  try {
    const { page: objPage } = await validator.validateSimplePaginationSchema({
      page: {
        size: 500,
        number: 1,
      },
      ...req.query
    });

    const alertsInDb = await db.Alert.findAndCountAll({
      where: { expiresAt: { [Op.gte]: Date.now() } },
      unique: true,
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (alertsInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no active Alerts in the database",
      };
    }
    if (alertsInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }

    const mappedData = alertsInDb.rows.map(row => {
      const mapRow = {
        id: row.id,
        date: row.createdAt,
        title: row.title,
        message: row.message,
        url: row.siteUri,
        image: row.imageUri,
      };
      return mapRow;
    });

    return res.status(StatusCodes.OK).send(mappedData);
  } catch (error) {
    console.error("alerts could not be recovered: ", error.message);
    return next(error);
  }
};

module.exports = {
  registerPush,
  getListActive,
};
