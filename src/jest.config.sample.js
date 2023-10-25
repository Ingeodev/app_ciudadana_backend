// Save your configuration as jest.config.js
const config = {
  // Sequencer:
  testSequencer: "./jest.custom-sequencer.js",
  // Test folder or files to ignore
  testPathIgnorePatterns: ["utils"], // Add the test-file names or -folder names that you want to ignore.
  // Global jest constants
  globals: {
    notificationsMicroserviceOnlineHost:
      "https://notifications-cmiesjcqoq-ue.a.run.app",
    notificationsMicroserviceLocalHost: "http://localhost:3000",
    notificationsMicroserviceDefaultHost: "http://localhost:3000", // Replace with the local or online host
    usersMicroserviceOnlineHost: "https://users-cmiesjcqoq-ue.a.run.app",
    usersMicroserviceLocalHost: "http://localhost:3000",
    usersMicroserviceDefaultHost: "http://localhost:3000", // Replace with the local or online host
    thirdPartiesMicroserviceOnlineHost:
      "https://third-parties-cmiesjcqoq-ue.a.run.app",
    thirdPartiesMicroserviceLocalHost: "http://localhost:3000",
    thirdPartiesMicroserviceDefaultHost: "http://localhost:3000", // Replace with the local or online host
    adminsMicroserviceOnlineHost: "https://admin-cmiesjcqoq-ue.a.run.app",
    adminsMicroserviceLocalHost: "http://localhost:3000",
    adminsMicroserviceDefaultHost: "http://localhost:3000", // Replace with the local or online host
    fileManagementMicroserviceOnlineHost:
      "https://file-management-cmiesjcqoq-ue.a.run.app",
    fileManagementMicroserviceLocalHost: "http://localhost:3000",
    fileManagementMicroserviceDefaultHost: "http://localhost:3000", // Replace with the local or online host
    trafficMicroserviceOnlineHost: "https://traffic-cmiesjcqoq-ue.a.run.app",
    trafficMicroserviceLocalHost: "http://localhost:3000",
    trafficMicroserviceDefaultHost: "http://localhost:3000", // Replace with the local or online host
    testImageInStorage: "test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f3.png", // MUST Change
    firebaseKey: "firebaseAccessKey", // MUST Change
    firebaseTestMobileUserLogin: {
      returnSecureToken: true,
      email: "testMobile@testmail.com", // MUST Change
      password: "123456", // MUST Change
      clientType: "CLIENT_TYPE_WEB",
    },
    firebaseTestWebUserLogin: {
      returnSecureToken: true,
      email: "testWeb@testmail.com", // MUST Change
      password: "123456", // MUST Change
      clientType: "CLIENT_TYPE_WEB",
    },
  },
};

module.exports = config;

