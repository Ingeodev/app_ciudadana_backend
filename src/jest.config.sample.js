// Save your configuration as jest.config.js
const config = {
    // Sequencer:
    testSequencer: './jest.custom-sequencer.js',
    // Test folder or files to ignore
    testPathIgnorePatterns: ['utils'],  // Add the test-file names or -folder names that you want to ignore.
    // Global jest constants
    globals: {
        notificationsMicroserviceLocalHost: 'http://localhost:3000',
        notificationsMicroserviceOnlineHost: 'https://notifications-cmiesjcqoq-uc.a.run.app',
        notificationsMicroserviceDefaultHost: 'http://localhost:3000',  // Replace with the local or online host
        usersMicroserviceLocalHost: 'http://localhost:3001',
        usersMicroserviceOnlineHost: 'https://users-cmiesjcqoq-uc.a.run.app',
        usersMicroserviceDefaultHost: 'http://localhost:3001',          // Replace with the local or online host
        adminMicroserviceLocalHost: 'http://localhost:3002',
        adminMicroserviceOnlineHost: 'https://admin-cmiesjcqoq-uc.a.run.app',
        adminMicroserviceDefaultHost: 'http://localhost:3002',          // Replace with the local or online host
        fileManagementMicroserviceLocalHost: 'http://localhost:3003',
        fileManagementMicroserviceOnlineHost: 'https://file-management-cmiesjcqoq-uc.a.run.app',
        fileManagementMicroserviceDefaultHost: 'http://localhost:3003',          // Replace with the local or online host
        thirdPartiesMicroserviceLocalHost: 'http://localhost:3004',
        thirdPartiesMicroserviceOnlineHost: 'https://third-parties-cmiesjcqoq-uc.a.run.app',
        thirdPartiesMicroserviceDefaultHost: 'http://localhost:3004',          // Replace with the local or online host
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