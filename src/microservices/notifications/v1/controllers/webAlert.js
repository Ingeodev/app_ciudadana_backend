const { StatusCodes } = require("http-status-codes");
const { Model } = require("sequelize");
const axios = require("axios");

const { appFirebase } = require("../../../../middleware/authMiddleware")
const validator = require("../../utils/validator");
const db = require("../../../../models/index");

const firebaseCMTopicName = process.env.FCM_TOPIC_NAME_MOBILE;
const sigmaSMSToken = process.env.SIGMA_ACCOUNT_KEY;
const sigmaSmsApiUri = "http://aio2.sigmamovil.com/api/sms";
const defaultUsersBatchSize = 100000;
// const twilioMessageServiceSid = process.env.TWILIO_MESSAGE_SERVICE_SID;

/**
 * Function that returns a batch of rows from the database, but defaults to users data.
 * @param {Model} userModel The Sequelize model to use (for users if default)
 * @param {number} batchNumber The number of the batch to retrieve, batches start at 0
 * @param {number} batchSize The size of the batches to retrieve
 * @param {object} findAllOptions Options object as defined in [sequelize](https://sequelize.org/api/v6/class/src/model.js~model#static-method-findAll); Will overwrite all the default (user) options excepting the limit and offset.
 * @returns A list of the users (or objects) found in the database.
 */
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
    attributes: ['id', 'clientId', 'phone', 'pushDeviceToken'],
    paranoid: true,
    order: ["id"],
    ...findAllOptions,
    offset,
    limit: batchSize,
  };
  return await userModel.findAll(options);
};

/**
 * Function that sends push notifications using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging). It requires that an appropriate `FCM_TOPIC_NAME_MOBILE` is defined in the .env file.
 * @param {string} title The title for the push notification
 * @param {string} message The message for the push notification
 * @param {string} imageUri The URI to an image to show in the push notification
 * @param {string} siteUri The URI to a website to use from the push notification
 * @returns `true` if Firebase accepts the notification, `false` otherwise.
 */
const sendPushNotifications = async (title, message, imageUri, siteUri) => {
  try {
    // Code from https://firebase.google.com/docs/cloud-messaging/android/send-image?hl=es-419#build_the_send_request updated from current API (https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messaging.md#messagingsend).
    const notification = {
      notification: {
        title,
        body: message,
        imageUrl: imageUri,
      },
      data: {
        url: siteUri,
      },
      android: {
        notification: { imageUrl: imageUri, }
      },
      apns: {
        payload: {
          aps: { mutableContent: 1 }
        },
        fcmOptions: { imageUrl: imageUri, }
      },
      webpush: {
        headers: { image: imageUri, },
        notification: { image: imageUri },
      },
      topic: firebaseCMTopicName,
    };
    const firebaseResponse = await appFirebase.messaging().send(notification);
    // Code based on the API (https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messaging.md#messagingsendtotopic).
    // const firebaseResponse = await appFirebase.messaging().sendToTopic(firebaseCMTopicName, {
    //   notification: {
    //     title,
    //     body: message,
    //     icon: imageUri,
    //   },
    //   data: {
    //     url: siteUri,
    //   },
    // }, {
    //   dryRun: true
    // });
    console.log('firebaseResponse:', firebaseResponse);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Function that sends a bulk of SMS messages using the SIGMA SMS service. It requires that appropriate `sigmaSMSToken` `sigmaAPIURI` are defined.
 * @param {string} name The campaign name to send the SMS.
 * @param {string} message The message to send in the SMS.
 * @param {string[]} usersPhoneNumbers List of users' phone numbers (MUST include the zone identifier, e.g. +57). The zone identifier must only have 2 digits.
 * @returns ``true`` if SIGMA gives a positive answer; `false` otherwise.
 */
const sendSmsNotifications = async (name, message, usersPhoneNumbers) => {
  try {
    const requestHeaders = {
      Authorization: `Bearer ${sigmaSMSToken}`,
      'Content-Type': 'application/json',
    };
    const receiver = usersPhoneNumbers.map(phoneNumber => {
      const userData = {
        indicative: phoneNumber.substring(1, 3),
        phone: phoneNumber.substring(3),
        message,
      };
      return userData;
    });
    const smsCreationObj = {
      idSmsCategory: 1,   // Assume 1 for Notifications 
      name,
      receiver,           // List of receivers
      dateNow: 1,         // To send now
      type: "lote",       // to send multiple SMSs
      track: 0,           // Don't track
      sendPush: 0,        // Don't send as push notificaiton
      api: 1,             // Use API (Should always be 1)
      notification: 0,    // Don't notify us when success
    };
    const sigmaResponse = await axios.post(sigmaSmsApiUri, smsCreationObj, {
      headers: requestHeaders,
    })
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const sendAlerts = async (req, res, next) => {
  try {
    const { title, message, siteUri, imageUri, push, sms, expiresAt } =
      await validator.validateAlertSchema(req.body);
    if (!(push || sms))
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: "At least one alert option must be true: push, sms",
      };
    const adminUserData = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ['id'],
    });
    if (adminUserData == null || adminUserData.id == null)
      throw {
        message: 'Requesting user is not allowed to send alerts or is not registered in the database yet.',
        status: StatusCodes.FORBIDDEN,
      };
    const sentBy = adminUserData.id;
    const usersCount = await db.User.count({
      where: { disabled: false, userMobile: true },
    });
    const totalBatches = Math.floor(usersCount / defaultUsersBatchSize);
    const acceptedAlerts = {
      count: usersCount,
      push: false,
      sms: false,
    };
    if (push)
      acceptedAlerts.push = await sendPushNotifications(title, message, imageUri, siteUri);
    if (sms && usersCount > 0) {
      for (let i = 0; i <= totalBatches; i++) {
        const usersDataBatch = await getUsersInBatches(db.User, i, defaultUsersBatchSize);
        const usersPhoneNumbers = usersDataBatch.map((user) => user.phone);
        acceptedAlerts.sms = await sendSmsNotifications(title, message, usersPhoneNumbers);
      }
    }
    let expirationDate;
    if (expiresAt == null)
      expirationDate = new Date(Date.now() + (3600 * 1000 * 24)).toUTCString();
    else
      expirationDate = expiresAt.toUTCString();
    const savedAlert = await db.Alert.create({
      title, message, siteUri, imageUri, sentBy,
      isPUSH: push,
      isSMS: sms,
      expiresAt: expirationDate,
    });

    return res
      .status(StatusCodes.ACCEPTED)
      .json({
        meta: {
          message: "The alerts are being sent by the external services.",
          acceptedAlerts,
        },
        data: { ...savedAlert.dataValues, deletedAt: undefined, updatedAt: undefined },
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
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const alertsInDb = await db.Alert.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      attributes: {
        exclude: ["deletedAt", "updatedAt"],
      },
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
