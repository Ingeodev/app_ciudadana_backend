const { StatusCodes } = require("http-status-codes");

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioMessageServiceSid = process.env.TWILIO_MESSAGE_SERVICE_SID;
const twilioClient = require("twilio")(twilioAccountSid, twilioAuthToken);

const validator = require("../../utils/validator");
const db = require("../../../../models/index");

const getUsersInBatches = async (
  userModel,
  batchNumber = 0,
  batchSize = 100,
  findAllOptions = {}
) => {
  if (batchNumber < 0) throw new Error("batchNumber cannot be lower than 0.");
  if (batchSize < 1) throw new Error("batchSize cannot be lower than 1.");
  const offset = batchNumber * batchSize;
  const options = {
    where: { disabled: false, userMobile: true },
    attributes: {
      exclude: [
        "name",
        "lastName",
        "email",
        "documentType",
        "numberDocument",
        "residenceAddress",
        "serviceReceiptUri",
        "siteUri",
        "loginPhase",
        "disabled",
        "userMobile",
        "createdAt",
        "updatedAt",
      ],
    },
    paranoid: true,
    order: ["id"],
    ...findAllOptions,
    offset,
    limit: batchSize,
  };
  return await userModel.findAll(options);
};

const sendPushNotifications = async (message, usersPushIds) => {
  try {
    // TODO: send push notifications.
    console.log("TODO: send push notifications.");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const sendSmsNotifications = async (message, usersPhoneNumbers) => {
  try {
    const smsPromises = usersPhoneNumbers.map((number) => {
      twilioClient.messages.create({
        messagingServiceSid: twilioMessageServiceSid,
        body: message,
        to: number,
      });
    });
    const smsResponses = await Promise.allSettled(smsPromises);
    const fulfilled = smsResponses.filter(resp => (resp.status === 'fulfilled'));
    if (fulfilled.length() < smsResponses.length() * 0.1)
      return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const sendAlertListNotifications = async (message, usersAlertListIds) => {
  try {
    // TODO: send alert-list notifications.
    console.log("TODO: send alert-list notifications.");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const sendAlerts = async (req, res, next) => {
  const batchSize = 10000;
  try {
    const { message, push, sms, alertList } =
      await validator.validateAlertSchema(req.body);
    if (!(push || sms || alertList))
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: "At least one alert option must be true: push, sms, alertList",
      };
    const usersCount = await db.User.count({
      where: { disabled: false, userMobile: true },
    });
    const totalBatches = Math.floor(usersCount / batchSize);
    const alertsSent = {};
    for (let i = 0; i <= totalBatches; i++) {
      const usersData = await getUsersInBatches(db.User, i, batchSize);
      if (push) {
        const usersPushIds = usersData.map((user) => user.clientId); // TODO: Revisar; podría ser mejor con un topic.
        alertsSent.push = await sendPushNotifications(message, usersPushIds); //Si fuera topic, iría simplemente fuera del for.
      }
      if (sms) {
        const usersPhoneNumbers = usersData.map((user) => user.phone);
        alertsSent.sms = await sendSmsNotifications(message, usersPhoneNumbers);
      }
      if (alertList) {
        const usersAlertListIds = usersData.map((user) => user.id); // TODO: Revisar; no sé cómo sería.
        alertsSent.alertList = await sendAlertListNotifications(
          message,
          usersAlertListIds
        );
      }
    }
    // TODO: Save alert in database

    return res
      .status(StatusCodes.ACCEPTED)
      .json({
        meta: {
          message: "The alerts are being sent by the external services.",
        },
        data: { alertsSent },
      });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all alerts
 * @return {object} Response contains: statuscode (integer), json (objeto): data Users. Or if there's error, json (objeto): status, code, detail
 */
const getlistAll = async (req, res, next) => {
  try {
    const objPage = await validator.vGetAlertsListAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 10,
    });

    const alertsInDb = await db.Alert.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (alertsInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The requested page does not exist",
      };
    }
    const totalPages = Math.ceil(alertsInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: alertsInDb.count,
        totalPages: totalPages,
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
  sendAlerts,
  getlistAll,
};
