// Save your configuration as jest.config.js
const config = {
    // Sequencer:
    testSequencer: './jest.custom-sequencer.js',
    // Test folder or files to ignore
    testPathIgnorePatterns: ['utils'],  // Add the test-file names or -folder names that you want to ignore.
    // Global jest constants
    globals: {
        notificationsMicroserviceLocalHost: 'http://localhost:3000',
        notificationsMicroserviceOnlineHost: 'https://k7gmmdc9dj.us-east-1.awsapprunner.com',
        notificationsMicroserviceDefaultHost: 'http://localhost:3000',  // Replace with the local or online host
        usersMicroserviceLocalHost: 'http://localhost:3001',
        usersMicroserviceOnlineHost: 'https://vbxb7pp27j.us-east-1.awsapprunner.com',
        usersMicroserviceDefaultHost: 'http://localhost:3001',          // Replace with the local or online host
        firebaseKey: 'firebaseAccessKey',           // MUST Change
        firebaseTestMobileUserLogin: {
            returnSecureToken: true,
            email: "testMobile@testmail.com",       // MUST Change
            password: "123456",                     // MUST Change
            clientType: "CLIENT_TYPE_WEB",
        },
        firebaseTestWebUserLogin: {
            returnSecureToken: true,
            email: "testWeb@testmail.com",          // MUST Change
            password: "123456",                     // MUST Change
            clientType: "CLIENT_TYPE_WEB",
        },
    },
};

module.exports = config;