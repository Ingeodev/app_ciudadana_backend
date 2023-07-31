const { StatusCodes } = require('http-status-codes');

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
        // TODO: send sms notifications.
        console.log("TODO: send sms notifications.");
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
                message: "At least one of the following must be true: push, sms, alertList",
            };
        const usersCount = await db.User.count({ where: { disabled: false, userMobile: true } });
        const totalBatches = Math.floor(usersCount / batchSize);
        const responses = [];
        for (let i = 0; i <= totalBatches; i++) {
            const usersData = await getUsersInBatches(db.User, i, batchSize);
            if (push) {
                const usersPushIds = usersData.map(user => user.clientId);
                await sendPushNotifications(message, usersPushIds);
            }
            if (sms) {
                const usersPhoneNumbers = usersData.map(user => user.phone);
                await sendPushNotifications(message, usersPhoneNumbers);
            }
            if (alertList) {
                const usersAlertListIds = usersData.map(user => user.id);   // TODO: Revisar; no sé cómo sería.
                await sendPushNotifications(message, usersAlertListIds);
            }
        }
        // TODO: Save alert in database

        return res.status(StatusCodes.OK)
            .json({ msg: 'Sample Alert sending...' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendAlerts,
};