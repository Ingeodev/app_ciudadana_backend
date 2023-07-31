const { StatusCodes } = require('http-status-codes');

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioMessageServiceSid = process.env.TWILIO_MESSAGE_SERVICE_SID;
const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

const validator = require('../../utils/validator');
const db = require("../../../../models/index");

const getUsersInBatches = async (userModel, batchNumber = 0, batchSize = 100, findAllOptions = {}) => {
    if (batchNumber < 0)
        throw new Error('batchNumber cannot be lower than 0.');
    if (batchSize < 1)
        throw new Error('batchSize cannot be lower than 1.');
    const offset = batchNumber * batchSize;
    const options = {
        where: { disabled: false, userMobile: true },
        attributes: {
            exclude: ['name', 'lastName', 'email', 'documentType', 'numberDocument',
                'residenceAddress', 'serviceReceiptUri', 'serviceReceiptSiteUri', 'loginPhase', 'disabled',
                'userMobile', 'createdAt', 'updatedAt']
        },
        paranoid: true,
        order: ['id'],
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
        const smsPromises = usersPhoneNumbers.map(number => {
            twilioClient.messages.create({
                messagingServiceSid: twilioMessageServiceSid,
                body: message,
                to: number
            })
        });
        // TODO: continue...
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
    const batchSize = 100;
    try {
        const { message, push, sms, alertList } = await validator.validateAlertSchema(req.body);
        if (!(push || sms || alertList))
            throw {
                status: StatusCodes.UNPROCESSABLE_ENTITY,
                message: "At least one alert option must be true: push, sms, alertList",
            };
        const usersCount = await db.User.count({ where: { disabled: false, userMobile: true } });
        const totalBatches = Math.floor(usersCount / batchSize);
        const alertsSent = {};
        for (let i = 0; i <= totalBatches; i++) {
            const usersData = await getUsersInBatches(db.User, i, batchSize);
            if (push) {
                const usersPushIds = usersData.map(user => user.clientId);
                alertsSent.push = await sendPushNotifications(message, usersPushIds);
            }
            if (sms) {
                const usersPhoneNumbers = usersData.map(user => user.phone);
                alertsSent.sms = await sendSmsNotifications(message, usersPhoneNumbers);
            }
            if (alertList) {
                const usersAlertListIds = usersData.map(user => user.id);   // TODO: Revisar; no sé cómo sería.
                alertsSent.alertList = await sendAlertListNotifications(message, usersAlertListIds);
            }
        }
        // TODO: Save alert in database

        return res.status(StatusCodes.ACCEPTED)
            .json({ message: 'The alerts are being sent by the external services.', alertsSent });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendAlerts,
};