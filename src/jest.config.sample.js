// Save your configuration as jest.config.js
const config = {
    globals: {
        notificationsMicroserviceLocalHost: 'http://localhost:3000',
        notificationsMicroserviceOnlineHost: 'https://k7gmmdc9dj.us-east-1.awsapprunner.com',
        usersMicroserviceLocalHost: 'http://localhost:3001',
        usersMicroserviceOnlineHost: 'https://vbxb7pp27j.us-east-1.awsapprunner.com',
        firebaseKey: 'firebaseAccessKey',   // MUST Change
        firebaseTestUserLogin: {
            returnSecureToken: true,
            email: "test@testmail.com",     // MUST Change
            password: "123456",             // MUST Change
            clientType: "CLIENT_TYPE_WEB",
        },
    },
};

module.exports = config;